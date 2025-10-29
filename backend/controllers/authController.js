const sql = require("../config/db");
const generateAuthRecord = require("../middlewares/generateAuthRecord");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const speakeasy = require("speakeasy");
const sendEmail = require("../middlewares/emailMiddleware");

// ---------------- SIGNUP (with automatic 2FA setup) ----------------
exports.signUp = async (req, res) => {
  try {
    const { email, role, name, level_id, password } = req.body;

    // ✅ تحقق من القيم الأساسية
    if (!email || !role || !password) {
      return res
        .status(400)
        .json({ error: "الرجاء إدخال البريد الإلكتروني، الدور، وكلمة المرور" });
    }

    // ✅ تحقق من وجود البريد مسبقًا
    const existing = await sql`SELECT id FROM auth WHERE email = ${email}`;
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: "البريد الإلكتروني مستخدم بالفعل، الرجاء استخدام بريد آخر." });
    }

    // ✅ إنشاء سجل المستخدم الأساسي
    let authId;
    try {
      authId = await generateAuthRecord({ email, role, password });
    } catch (err) {
      return res.status(500).json({
        error: "فشل في إنشاء سجل المستخدم الأساسي",
        details: err.message,
      });
    }

    // ✅ إدخال بيانات إضافية حسب الدور
    try {
      if (role === "student") {
        if (!name || !level_id)
          return res
            .status(400)
            .json({ error: "يجب إدخال الاسم والمستوى للطالب." });

        await sql`
          INSERT INTO student (id, name, level_id)
          VALUES (${authId}, ${name}, ${level_id});
        `;
      } else if (role === "faculty") {
        if (!name)
          return res
            .status(400)
            .json({ error: "يجب إدخال الاسم للأستاذ." });

        await sql`
          INSERT INTO faculty (id, name)
          VALUES (${authId}, ${name});
        `;
      }
    } catch (err) {
      console.error("❌ خطأ في إدخال بيانات الدور:", err.message);
      return res.status(500).json({
        error: "فشل في حفظ بيانات الدور في قاعدة البيانات",
        details: err.message,
      });
    }

    // ✅ إنشاء سر Google Authenticator
    const secret = speakeasy.generateSecret({
      name: `SmartSchedule (${email})`,
    });

    // ✅ تحديث جدول auth لإضافة بيانات 2FA
    try {
      await sql`
        UPDATE auth 
        SET otp_secret = ${secret.base32}, otp_enabled = true
        WHERE id = ${authId};
      `;
    } catch (err) {
      console.error("❌ خطأ في تحديث بيانات OTP:", err.message);
      return res.status(500).json({
        error: "فشل في تفعيل المصادقة الثنائية للمستخدم",
        details: err.message,
      });
    }

    // ✅ رد نهائي
    res.status(201).json({
      message:
        "تم إنشاء الحساب بنجاح ✅ امسح رمز QR باستخدام Google Authenticator قبل تسجيل الدخول.",
      authId,
      role,
      otp_url: secret.otpauth_url, // لإنتاج الكود على الواجهة
      otp_code: secret.base32, // الكود اليدوي لو احتاجه المستخدم
    });
  } catch (err) {
    console.error("❌ خطأ في signUp:", err.message);
    return res.status(500).json({
      error: "حدث خطأ أثناء إنشاء الحساب",
      details: err.message,
    });
  }
};

// ---------------- LOGIN (requires password + OTP) ----------------
exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const userResult = await sql`SELECT * FROM auth WHERE email = ${email}`;
    if (userResult.length === 0)
      return res.status(401).json({ error: "Invalid email or password" });

    const user = userResult[0];

    if (user.status !== "active")
      return res.status(403).json({ error: "Account is inactive or suspended" });

    const isMatch = await bcrypt.compare(password, user.hashpassword);
    if (!isMatch)
      return res.status(401).json({ error: "Invalid email or password" });

    // ✅ تحقق من OTP
    if (!otp)
      return res.status(400).json({ error: "OTP is required for login" });

    const verified = speakeasy.totp.verify({
      secret: user.otp_secret,
      encoding: "base32",
      token: otp,
      window: 2,
    });

    if (!verified) return res.status(400).json({ error: "Invalid OTP code" });

    // ✅ إنشاء JWT
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("❌ Error in login:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// ---------------- PASSWORD RESET ----------------
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const userResult = await sql`SELECT * FROM auth WHERE email = ${email}`;
    if (userResult.length === 0)
      return res.status(404).json({ error: "User not found" });

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Password Reset",
      text: `Click to reset your password: ${resetLink}`,
      html: `<p>You requested to reset your password.</p>
             <a href="${resetLink}" style="color:#1a73e8;">Reset Password</a>`,
    });

    res.json({ message: "Reset link sent to email" });
  } catch (err) {
    console.error("❌ Error in requestPasswordReset:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res
        .status(400)
        .json({ error: "Token and new password are required" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userResult =
      await sql`SELECT * FROM auth WHERE email = ${decoded.email}`;
    if (userResult.length === 0)
      return res.status(404).json({ error: "User not found" });

    const hashpassword = await bcrypt.hash(newPassword, 10);
    await sql`
      UPDATE auth 
      SET hashpassword = ${hashpassword}
      WHERE email = ${decoded.email};
    `;

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Error in resetPassword:", err.message);
    res.status(400).json({ error: "Invalid or expired reset token" });
  }
};

// ---------------- ADMIN ----------------
exports.getAllUsers = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, role, status, otp_enabled
      FROM auth
      ORDER BY id ASC;
    `;
    res.json(users);
  } catch (err) {
    console.error("❌ Error in getAllUsers:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status))
      return res.status(400).json({ error: "Invalid status value" });

    const result = await sql`
      UPDATE auth 
      SET status = ${status}
      WHERE id = ${userId}
      RETURNING id, email, role, status;
    `;

    if (result.length === 0)
      return res.status(404).json({ error: "User not found" });

    res.json({ message: "User status updated", user: result[0] });
  } catch (err) {
    console.error("❌ Error in updateUserStatus:", err.message);
    res.status(500).json({ error: err.message });
  }
};
