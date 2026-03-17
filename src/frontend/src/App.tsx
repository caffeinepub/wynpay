import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  History,
  Send,
  Wallet,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────
type Screen =
  | "splash"
  | "login-phone"
  | "login-otp"
  | "signup-details"
  | "signup-otp"
  | "signup-password"
  | "forgot-phone"
  | "forgot-otp"
  | "forgot-password"
  | "dashboard";

const DEMO_OTP = "123456";
const OTP_COUNTDOWN = 30;

// ─── OTP Input Component ─────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    const joined = next.join("");
    onChange(joined);
    if (char && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-3 justify-center" data-ocid="otp.input">
      {digits.map((d, i) => (
        <input
          key={i.toString()}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-muted text-foreground transition-all duration-200 outline-none focus:border-primary focus:shadow-gold"
          style={{
            borderColor: d ? "oklch(0.72 0.14 75)" : "oklch(0.28 0.03 250)",
          }}
        />
      ))}
    </div>
  );
}

// ─── Screen Wrapper ──────────────────────────────────────────────────────────
function ScreenWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`min-h-screen flex flex-col ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ─── OTP Timer Hook ──────────────────────────────────────────────────────────
function useOtpTimer() {
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const startTimer = useCallback(() => {
    setCountdown(OTP_COUNTDOWN);
    setCanResend(false);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return { countdown, canResend, startTimer };
}

// ─── Password Field ──────────────────────────────────────────────────────────
function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  id,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  id: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground text-sm font-medium">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "••••••••"}
          className="bg-muted border-border pr-12 h-12 rounded-xl focus:border-primary"
          data-ocid={`${id}.input`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");

  // Form state
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState("Alex Johnson");

  const { countdown, canResend, startTimer } = useOtpTimer();

  const navigate = (s: Screen) => {
    setOtp("");
    setErrors({});
    setScreen(s);
  };

  const sendOtp = (nextScreen: Screen) => {
    startTimer();
    navigate(nextScreen);
    toast.success("OTP sent! For demo: use code 123456", {
      duration: 5000,
      icon: "📱",
    });
  };

  const validateOtp = () => {
    if (otp.replace(/\s/g, "").length < 6) {
      setErrors({ otp: "Please enter the 6-digit OTP" });
      return false;
    }
    if (otp !== DEMO_OTP) {
      setErrors({ otp: "Incorrect OTP. Use 123456 for demo." });
      return false;
    }
    return true;
  };

  const validatePhone = () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 10) {
      setErrors({ phone: "Please enter a valid phone number" });
      return false;
    }
    return true;
  };

  // ── Splash ──────────────────────────────────────────────────────────────────
  const SplashScreen = () => (
    <ScreenWrapper className="items-center justify-center px-6">
      <div className="w-full max-w-[430px] flex flex-col items-center gap-8">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.14 75) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, oklch(0.55 0.12 185) 0%, transparent 70%)",
            }}
          />
        </div>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
          className="relative"
        >
          <img
            src="/assets/generated/wynpay-logo-transparent.dim_512x512.png"
            alt="WynPay"
            className="w-40 h-40 object-contain"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-bold gold-text tracking-tight">
            wynpay
          </h1>
          <p className="text-muted-foreground text-lg">
            Smart Payments, Simplified
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Zap size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">
              Fast · Secure · Global
            </span>
            <Zap size={14} className="text-primary" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full space-y-3"
        >
          <Button
            className="w-full h-14 text-lg font-semibold rounded-2xl gold-gradient text-background hover:opacity-90 transition-opacity shadow-gold"
            onClick={() => navigate("login-phone")}
            data-ocid="splash.login_button"
          >
            Login
          </Button>
          <Button
            variant="outline"
            className="w-full h-14 text-lg font-semibold rounded-2xl border-2 border-secondary text-secondary hover:bg-secondary/10 transition-colors"
            onClick={() => navigate("signup-details")}
            data-ocid="splash.signup_button"
          >
            Create Account
          </Button>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center">
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </ScreenWrapper>
  );

  // ── Auth Layout Wrapper ─────────────────────────────────────────────────────
  const AuthCard = ({
    children,
    title,
    subtitle,
    onBack,
  }: {
    children: React.ReactNode;
    title: string;
    subtitle?: string;
    onBack?: () => void;
  }) => (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div
        className="absolute top-0 left-0 right-0 h-64 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.72 0.14 75 / 0.3) 0%, transparent 70%)",
        }}
      />
      <div className="w-full max-w-[430px]">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="auth.back_button"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
        )}

        <div className="mb-8">
          <img
            src="/assets/generated/wynpay-logo-transparent.dim_512x512.png"
            alt="WynPay"
            className="w-16 h-16 object-contain mb-4"
          />
          <h2 className="text-3xl font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>

        <div className="card-glass rounded-2xl p-6 space-y-5">{children}</div>
      </div>
    </div>
  );

  // ── Login Phone ──────────────────────────────────────────────────────────────
  const LoginPhoneScreen = () => (
    <ScreenWrapper>
      <AuthCard
        title="Welcome back"
        subtitle="Enter your phone number to continue"
        onBack={() => navigate("splash")}
      >
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Phone Number
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors({});
            }}
            placeholder="+1 (555) 000-0000"
            className="bg-muted border-border h-12 rounded-xl focus:border-primary text-lg"
            data-ocid="login.phone.input"
          />
          {errors.phone && (
            <p
              className="text-destructive text-sm"
              data-ocid="login.phone.error_state"
            >
              {errors.phone}
            </p>
          )}
        </div>

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            if (validatePhone()) sendOtp("login-otp");
          }}
          data-ocid="login.send_otp.button"
        >
          Send OTP
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate("forgot-phone")}
            className="text-secondary hover:text-secondary/80 text-sm font-medium transition-colors"
            data-ocid="login.forgot_password.link"
          >
            Forgot Password?
          </button>
        </div>

        <div className="border-t border-border pt-4 text-center">
          <span className="text-muted-foreground text-sm">New to WynPay? </span>
          <button
            type="button"
            onClick={() => navigate("signup-details")}
            className="text-primary font-semibold text-sm hover:opacity-80 transition-opacity"
            data-ocid="login.signup.link"
          >
            Create Account
          </button>
        </div>
      </AuthCard>
    </ScreenWrapper>
  );

  // ── Login OTP ────────────────────────────────────────────────────────────────
  const LoginOtpScreen = () => (
    <ScreenWrapper>
      <AuthCard
        title="Verify your number"
        subtitle={`Enter the 6-digit code sent to ${phone}`}
        onBack={() => navigate("login-phone")}
      >
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            setErrors({});
          }}
        />

        {errors.otp && (
          <p
            className="text-destructive text-sm text-center"
            data-ocid="login.otp.error_state"
          >
            {errors.otp}
          </p>
        )}

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={() => {
                startTimer();
                toast.success("OTP resent! Use 123456 for demo", {
                  icon: "📱",
                });
              }}
              className="text-secondary text-sm font-medium hover:opacity-80 transition-opacity"
              data-ocid="login.otp.resend_button"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-muted-foreground text-sm">
              Resend in{" "}
              <span className="text-primary font-semibold">{countdown}s</span>
            </span>
          )}
        </div>

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            if (validateOtp()) {
              navigate("dashboard");
              toast.success("Welcome back to WynPay! 🎉");
            }
          }}
          data-ocid="login.verify.button"
        >
          Verify &amp; Login
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );

  // ── Signup Details ───────────────────────────────────────────────────────────
  const SignupDetailsScreen = () => (
    <ScreenWrapper>
      <AuthCard
        title="Create account"
        subtitle="Join millions who trust WynPay"
        onBack={() => navigate("splash")}
      >
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Full Name
          </Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({});
            }}
            placeholder="Alex Johnson"
            className="bg-muted border-border h-12 rounded-xl focus:border-primary"
            data-ocid="signup.name.input"
          />
          {errors.name && (
            <p
              className="text-destructive text-sm"
              data-ocid="signup.name.error_state"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Phone Number
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors({});
            }}
            placeholder="+1 (555) 000-0000"
            className="bg-muted border-border h-12 rounded-xl focus:border-primary"
            data-ocid="signup.phone.input"
          />
          {errors.phone && (
            <p
              className="text-destructive text-sm"
              data-ocid="signup.phone.error_state"
            >
              {errors.phone}
            </p>
          )}
        </div>

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            const errs: Record<string, string> = {};
            if (!name.trim()) errs.name = "Please enter your full name";
            if (phone.replace(/\D/g, "").length < 10)
              errs.phone = "Please enter a valid phone number";
            if (Object.keys(errs).length) {
              setErrors(errs);
              return;
            }
            setUserName(name);
            sendOtp("signup-otp");
          }}
          data-ocid="signup.send_otp.button"
        >
          Send OTP
        </Button>

        <div className="border-t border-border pt-4 text-center">
          <span className="text-muted-foreground text-sm">
            Already have an account?{" "}
          </span>
          <button
            type="button"
            onClick={() => navigate("login-phone")}
            className="text-primary font-semibold text-sm hover:opacity-80 transition-opacity"
            data-ocid="signup.login.link"
          >
            Login
          </button>
        </div>
      </AuthCard>
    </ScreenWrapper>
  );

  // ── Signup OTP ───────────────────────────────────────────────────────────────
  const SignupOtpScreen = () => (
    <ScreenWrapper>
      <AuthCard
        title="Verify your number"
        subtitle={`We sent a code to ${phone}`}
        onBack={() => navigate("signup-details")}
      >
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            setErrors({});
          }}
        />

        {errors.otp && (
          <p
            className="text-destructive text-sm text-center"
            data-ocid="signup.otp.error_state"
          >
            {errors.otp}
          </p>
        )}

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={() => {
                startTimer();
                toast.success("OTP resent! Use 123456 for demo", {
                  icon: "📱",
                });
              }}
              className="text-secondary text-sm font-medium hover:opacity-80"
              data-ocid="signup.otp.resend_button"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-muted-foreground text-sm">
              Resend in{" "}
              <span className="text-primary font-semibold">{countdown}s</span>
            </span>
          )}
        </div>

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            if (validateOtp()) navigate("signup-password");
          }}
          data-ocid="signup.verify.button"
        >
          Verify
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );

  // ── Signup Password ──────────────────────────────────────────────────────────
  const SignupPasswordScreen = () => (
    <ScreenWrapper>
      <AuthCard
        title="Set your password"
        subtitle="Create a strong password for your account"
        onBack={() => navigate("signup-otp")}
      >
        <PasswordField
          id="signup-password"
          label="Password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setErrors({});
          }}
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <p
            className="text-destructive text-sm"
            data-ocid="signup.password.error_state"
          >
            {errors.password}
          </p>
        )}

        <PasswordField
          id="signup-confirm"
          label="Confirm Password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            setErrors({});
          }}
        />
        {errors.confirm && (
          <p
            className="text-destructive text-sm"
            data-ocid="signup.confirm.error_state"
          >
            {errors.confirm}
          </p>
        )}

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            const errs: Record<string, string> = {};
            if (password.length < 8)
              errs.password = "Password must be at least 8 characters";
            if (password !== confirmPassword)
              errs.confirm = "Passwords do not match";
            if (Object.keys(errs).length) {
              setErrors(errs);
              return;
            }
            navigate("dashboard");
            toast.success(`Welcome to WynPay, ${name}! 🎉`);
          }}
          data-ocid="signup.create_account.button"
        >
          Create Account
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );

  // ── Forgot Phone ─────────────────────────────────────────────────────────────
  const ForgotPhoneScreen = () => (
    <ScreenWrapper>
      <AuthCard
        title="Reset password"
        subtitle="Enter your registered phone number"
        onBack={() => navigate("login-phone")}
      >
        <div className="space-y-2">
          <Label className="text-muted-foreground text-sm font-medium">
            Phone Number
          </Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setErrors({});
            }}
            placeholder="+1 (555) 000-0000"
            className="bg-muted border-border h-12 rounded-xl focus:border-primary"
            data-ocid="forgot.phone.input"
          />
          {errors.phone && (
            <p
              className="text-destructive text-sm"
              data-ocid="forgot.phone.error_state"
            >
              {errors.phone}
            </p>
          )}
        </div>

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            if (validatePhone()) sendOtp("forgot-otp");
          }}
          data-ocid="forgot.send_otp.button"
        >
          Send OTP
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );

  // ── Forgot OTP ───────────────────────────────────────────────────────────────
  const ForgotOtpScreen = () => (
    <ScreenWrapper>
      <AuthCard
        title="Verify identity"
        subtitle={`Enter the code sent to ${phone}`}
        onBack={() => navigate("forgot-phone")}
      >
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            setErrors({});
          }}
        />

        {errors.otp && (
          <p
            className="text-destructive text-sm text-center"
            data-ocid="forgot.otp.error_state"
          >
            {errors.otp}
          </p>
        )}

        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={() => {
                startTimer();
                toast.success("OTP resent! Use 123456 for demo", {
                  icon: "📱",
                });
              }}
              className="text-secondary text-sm font-medium hover:opacity-80"
              data-ocid="forgot.otp.resend_button"
            >
              Resend OTP
            </button>
          ) : (
            <span className="text-muted-foreground text-sm">
              Resend in{" "}
              <span className="text-primary font-semibold">{countdown}s</span>
            </span>
          )}
        </div>

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            if (validateOtp()) navigate("forgot-password");
          }}
          data-ocid="forgot.verify.button"
        >
          Verify
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );

  // ── Forgot Password ──────────────────────────────────────────────────────────
  const ForgotPasswordScreen = () => (
    <ScreenWrapper>
      <AuthCard
        title="New password"
        subtitle="Create a new password for your account"
        onBack={() => navigate("forgot-otp")}
      >
        <PasswordField
          id="forgot-new-password"
          label="New Password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setErrors({});
          }}
          placeholder="At least 8 characters"
        />
        {errors.password && (
          <p
            className="text-destructive text-sm"
            data-ocid="forgot.password.error_state"
          >
            {errors.password}
          </p>
        )}

        <PasswordField
          id="forgot-confirm"
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v);
            setErrors({});
          }}
        />
        {errors.confirm && (
          <p
            className="text-destructive text-sm"
            data-ocid="forgot.confirm.error_state"
          >
            {errors.confirm}
          </p>
        )}

        <Button
          className="w-full h-12 rounded-xl font-semibold gold-gradient text-background hover:opacity-90"
          onClick={() => {
            const errs: Record<string, string> = {};
            if (password.length < 8)
              errs.password = "Password must be at least 8 characters";
            if (password !== confirmPassword)
              errs.confirm = "Passwords do not match";
            if (Object.keys(errs).length) {
              setErrors(errs);
              return;
            }
            navigate("login-phone");
            toast.success("Password reset successfully! Please login.");
          }}
          data-ocid="forgot.reset_password.button"
        >
          Reset Password
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );

  // ── Dashboard ────────────────────────────────────────────────────────────────
  const DashboardScreen = () => {
    const [activeTab, setActiveTab] = useState<"home" | "history" | "profile">(
      "home",
    );

    const transactions = [
      {
        id: 1,
        name: "Sarah Mitchell",
        amount: "-$45.00",
        date: "Today, 2:30 PM",
        type: "send",
        icon: "→",
      },
      {
        id: 2,
        name: "Netflix Subscription",
        amount: "-$15.99",
        date: "Yesterday",
        type: "pay",
        icon: "💳",
      },
      {
        id: 3,
        name: "James Wilson",
        amount: "+$120.00",
        date: "Mar 15",
        type: "receive",
        icon: "←",
      },
      {
        id: 4,
        name: "Coffee Shop",
        amount: "-$6.50",
        date: "Mar 14",
        type: "pay",
        icon: "☕",
      },
      {
        id: 5,
        name: "Alex Rivera",
        amount: "+$200.00",
        date: "Mar 12",
        type: "receive",
        icon: "←",
      },
    ];

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col max-w-[430px] mx-auto"
      >
        {/* Header */}
        <header
          className="px-5 pt-12 pb-4 flex items-center justify-between"
          data-ocid="dashboard.panel"
        >
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/wynpay-logo-transparent.dim_512x512.png"
              alt="WynPay"
              className="w-9 h-9 object-contain"
            />
            <div>
              <p className="text-muted-foreground text-xs">Good morning 👋</p>
              <p className="font-bold text-foreground">{userName}</p>
            </div>
          </div>
          <button
            type="button"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center relative"
            data-ocid="dashboard.notifications.button"
          >
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          </button>
        </header>

        <main className="flex-1 px-5 pb-24 space-y-6 overflow-y-auto">
          {/* Balance Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl p-6 relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.22 0.05 200), oklch(0.16 0.04 220))",
              border: "1px solid oklch(0.55 0.12 185 / 0.3)",
            }}
            data-ocid="dashboard.balance.card"
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.72 0.14 75) 0%, transparent 70%)",
                transform: "translate(20%, -20%)",
              }}
            />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">
                  Total Balance
                </p>
                <p className="text-4xl font-bold gold-text">$0.00</p>
                <p className="text-muted-foreground text-xs mt-2">
                  Account: **** **** 4821
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: "oklch(0.72 0.14 75 / 0.2)" }}
              >
                <Wallet size={22} className="text-primary" />
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 flex gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Sent</p>
                <p className="text-sm font-semibold text-foreground">$67.49</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-xs text-muted-foreground">Received</p>
                <p className="text-sm font-semibold text-foreground">$320.00</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {[
                {
                  icon: Send,
                  label: "Send",
                  color: "oklch(0.72 0.14 75)",
                  ocid: "dashboard.send.button",
                },
                {
                  icon: Download,
                  label: "Receive",
                  color: "oklch(0.55 0.12 185)",
                  ocid: "dashboard.receive.button",
                },
                {
                  icon: CreditCard,
                  label: "Pay",
                  color: "oklch(0.65 0.18 30)",
                  ocid: "dashboard.pay.button",
                },
                {
                  icon: History,
                  label: "History",
                  color: "oklch(0.5 0.15 280)",
                  ocid: "dashboard.history.button",
                },
              ].map(({ icon: Icon, label, color, ocid }) => (
                <button
                  type="button"
                  key={label}
                  data-ocid={ocid}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 group-active:scale-95"
                    style={{
                      background: color.replace(")", " / 0.15)"),
                      border: `1px solid ${color.replace(")", " / 0.3)")}`,
                    }}
                  >
                    <Icon size={22} style={{ color }} />
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Transactions
              </h3>
              <button
                type="button"
                className="text-xs text-primary font-medium"
                data-ocid="dashboard.transactions.link"
              >
                See All <ChevronRight size={12} className="inline" />
              </button>
            </div>

            <div className="space-y-3" data-ocid="dashboard.transactions.list">
              {transactions.map((tx, i) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border"
                  data-ocid={`dashboard.transactions.item.${i + 1}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                    style={{
                      background:
                        tx.type === "receive"
                          ? "oklch(0.55 0.12 185 / 0.15)"
                          : "oklch(0.72 0.14 75 / 0.12)",
                    }}
                  >
                    {tx.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{tx.name}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      tx.amount.startsWith("+")
                        ? "text-secondary"
                        : "text-foreground"
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </main>

        {/* Bottom Nav */}
        <nav
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] border-t border-border bg-background/95 backdrop-blur-xl"
          data-ocid="dashboard.bottom_nav.panel"
        >
          <div className="flex items-center justify-around px-4 py-3">
            {[
              { id: "home", icon: Wallet, label: "Home" },
              { id: "history", icon: History, label: "History" },
              { id: "profile", icon: Bell, label: "Alerts" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                type="button"
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className="flex flex-col items-center gap-1 px-5 py-1 transition-all"
                data-ocid={`dashboard.nav.${id}.tab`}
              >
                <Icon
                  size={22}
                  className={
                    activeTab === id ? "text-primary" : "text-muted-foreground"
                  }
                />
                <span
                  className={`text-xs font-medium ${
                    activeTab === id ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
                {activeTab === id && (
                  <div className="w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </nav>
      </motion.div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "oklch(0.22 0.025 250)",
            border: "1px solid oklch(0.72 0.14 75 / 0.3)",
            color: "oklch(0.95 0.01 250)",
          },
        }}
      />

      <AnimatePresence mode="wait">
        {screen === "splash" && <SplashScreen key="splash" />}
        {screen === "login-phone" && <LoginPhoneScreen key="login-phone" />}
        {screen === "login-otp" && <LoginOtpScreen key="login-otp" />}
        {screen === "signup-details" && (
          <SignupDetailsScreen key="signup-details" />
        )}
        {screen === "signup-otp" && <SignupOtpScreen key="signup-otp" />}
        {screen === "signup-password" && (
          <SignupPasswordScreen key="signup-password" />
        )}
        {screen === "forgot-phone" && <ForgotPhoneScreen key="forgot-phone" />}
        {screen === "forgot-otp" && <ForgotOtpScreen key="forgot-otp" />}
        {screen === "forgot-password" && (
          <ForgotPasswordScreen key="forgot-password" />
        )}
        {screen === "dashboard" && <DashboardScreen key="dashboard" />}
      </AnimatePresence>

      {/* Footer */}
      {screen === "splash" && (
        <footer className="fixed bottom-4 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:opacity-80 transition-opacity"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}
