import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Home,
  ShoppingCart,
  TrendingUp,
  User,
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
  | "home"
  | "rewards"
  | "newcomer-bonus"
  | "buy-rp"
  | "sell-rp"
  | "mine";

const DEMO_OTP = "123456";
const OTP_COUNTDOWN = 30;

const LEVELS = [
  {
    label: "L1",
    options: [
      { amount: 50, reward: 5 },
      { amount: 100, reward: 10 },
    ],
  },
  {
    label: "L2",
    options: [
      { amount: 200, reward: 20 },
      { amount: 300, reward: 30 },
    ],
  },
  {
    label: "L3",
    options: [
      { amount: 500, reward: 50 },
      { amount: 1000, reward: 100 },
    ],
  },
  {
    label: "L4",
    options: [
      { amount: 2000, reward: 200 },
      { amount: 3000, reward: 300 },
    ],
  },
  {
    label: "L5",
    options: [
      { amount: 5000, reward: 500 },
      { amount: 10000, reward: 1000 },
    ],
  },
  {
    label: "L6",
    options: [
      { amount: 15000, reward: 1500 },
      { amount: 20000, reward: 2000 },
    ],
  },
];

// ─── OTP Timer Hook ───────────────────────────────────────────────────────────
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

// ─── OTP Input ──────────────────────────────────────────────────────────────
function OtpInput({
  value,
  onChange,
}: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    onChange(next.join(""));
    if (char && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-2 justify-center" data-ocid="otp.input">
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
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-muted text-foreground transition-all duration-200 outline-none focus:border-primary"
            style={{
              borderColor: d ? "oklch(0.72 0.14 75)" : "oklch(0.28 0.03 250)",
            }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Demo OTP: <span className="font-semibold text-primary">123456</span>
      </p>
    </div>
  );
}

// ─── Screen Wrapper ──────────────────────────────────────────────────────────
function ScreenWrapper({
  children,
  className = "",
}: { children: React.ReactNode; className?: string }) {
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

// ─── Bottom Nav ──────────────────────────────────────────────────────────────
function BottomNav({
  active,
  onNavigate,
}: { active: Screen; onNavigate: (s: Screen) => void }) {
  const tabs: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: "home", label: "Home", icon: <Home size={22} /> },
    {
      id: "buy-rp",
      label: "Buy RP",
      icon: <span className="text-lg font-black">₨</span>,
    },
    {
      id: "sell-rp",
      label: "Sell RP",
      icon: <span className="text-lg font-black">💱</span>,
    },
    { id: "mine", label: "Mine", icon: <User size={22} /> },
  ];
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-200 z-50"
      data-ocid="home.bottom_nav.panel"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ id, label, icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => onNavigate(id)}
            className="flex flex-col items-center gap-0.5 px-4 py-1 transition-all"
            data-ocid={`nav.${id === "home" ? "home" : id === "buy-rp" ? "buy_rp" : id === "sell-rp" ? "sell_rp" : "mine"}.tab`}
          >
            <span className={active === id ? "text-blue-600" : "text-gray-400"}>
              {icon}
            </span>
            <span
              className={`text-xs font-medium ${
                active === id ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {active === id && (
              <div className="w-1 h-1 rounded-full bg-blue-600" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Auth Card Layout ─────────────────────────────────────────────────────────
function AuthCard({
  children,
  title,
  subtitle,
  onBack,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}) {
  return (
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
}

// ─── Splash Screen ────────────────────────────────────────────────────────────
function SplashScreen({ navigate }: { navigate: (s: Screen) => void }) {
  return (
    <ScreenWrapper className="items-center justify-center px-6">
      <div className="w-full max-w-[430px] flex flex-col items-center gap-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.14 75) 0%, transparent 70%)",
            }}
          />
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "backOut" }}
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
          By continuing, you agree to our Terms of Service &amp; Privacy Policy
        </p>
      </div>
    </ScreenWrapper>
  );
}

// ─── Login Phone Screen ───────────────────────────────────────────────────────
function LoginPhoneScreen({
  phone,
  setPhone,
  errors,
  setErrors,
  navigate,
  sendOtp,
}: {
  phone: string;
  setPhone: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  sendOtp: (next: Screen) => void;
}) {
  const validatePhone = () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setErrors({ phone: "Please enter a valid phone number" });
      return false;
    }
    return true;
  };

  return (
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
            placeholder="+91 98765 43210"
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
            className="text-primary font-semibold text-sm hover:opacity-80"
            data-ocid="login.signup.link"
          >
            Create Account
          </button>
        </div>
      </AuthCard>
    </ScreenWrapper>
  );
}

// ─── Login OTP Screen ─────────────────────────────────────────────────────────
function LoginOtpScreen({
  phone,
  otp,
  setOtp,
  errors,
  setErrors,
  navigate,
  startTimer,
  canResend,
  countdown,
}: {
  phone: string;
  otp: string;
  setOtp: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  startTimer: () => void;
  canResend: boolean;
  countdown: number;
}) {
  const validateOtp = () => {
    if (otp.replace(/\s/g, "").length < 6) {
      setErrors({ otp: "Please enter the 6-digit OTP" });
      return false;
    }
    if (otp.replace(/\s/g, "") !== DEMO_OTP) {
      setErrors({ otp: "Incorrect OTP. Use 123456 for demo." });
      return false;
    }
    return true;
  };

  return (
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
              className="text-secondary text-sm font-medium"
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
              navigate("home");
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
}

// ─── Signup Details Screen ────────────────────────────────────────────────────
function SignupDetailsScreen({
  name,
  setName,
  phone,
  setPhone,
  errors,
  setErrors,
  navigate,
  sendOtp,
  setUserName,
}: {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  sendOtp: (next: Screen) => void;
  setUserName: (v: string) => void;
}) {
  return (
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
            placeholder="+91 98765 43210"
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
            className="text-primary font-semibold text-sm hover:opacity-80"
            data-ocid="signup.login.link"
          >
            Login
          </button>
        </div>
      </AuthCard>
    </ScreenWrapper>
  );
}

// ─── Signup OTP Screen ────────────────────────────────────────────────────────
function SignupOtpScreen({
  phone,
  otp,
  setOtp,
  errors,
  setErrors,
  navigate,
  startTimer,
  canResend,
  countdown,
}: {
  phone: string;
  otp: string;
  setOtp: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  startTimer: () => void;
  canResend: boolean;
  countdown: number;
}) {
  const validateOtp = () => {
    if (otp.replace(/\s/g, "").length < 6) {
      setErrors({ otp: "Please enter the 6-digit OTP" });
      return false;
    }
    if (otp.replace(/\s/g, "") !== DEMO_OTP) {
      setErrors({ otp: "Incorrect OTP. Use 123456 for demo." });
      return false;
    }
    return true;
  };

  return (
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
                toast.success("OTP resent!", { icon: "📱" });
              }}
              className="text-secondary text-sm font-medium"
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
}

// ─── Signup Password Screen ───────────────────────────────────────────────────
function SignupPasswordScreen({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  setErrors,
  navigate,
  name,
}: {
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  name: string;
}) {
  return (
    <ScreenWrapper>
      <AuthCard
        title="Set your password"
        subtitle="Create a strong password"
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
            navigate("home");
            toast.success(`Welcome to WynPay, ${name}! 🎉`);
          }}
          data-ocid="signup.create_account.button"
        >
          Create Account
        </Button>
      </AuthCard>
    </ScreenWrapper>
  );
}

// ─── Forgot Phone Screen ──────────────────────────────────────────────────────
function ForgotPhoneScreen({
  phone,
  setPhone,
  errors,
  setErrors,
  navigate,
  sendOtp,
}: {
  phone: string;
  setPhone: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  sendOtp: (next: Screen) => void;
}) {
  const validatePhone = () => {
    if (phone.replace(/\D/g, "").length < 10) {
      setErrors({ phone: "Please enter a valid phone number" });
      return false;
    }
    return true;
  };

  return (
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
            placeholder="+91 98765 43210"
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
}

// ─── Forgot OTP Screen ────────────────────────────────────────────────────────
function ForgotOtpScreen({
  phone,
  otp,
  setOtp,
  errors,
  setErrors,
  navigate,
  startTimer,
  canResend,
  countdown,
}: {
  phone: string;
  otp: string;
  setOtp: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
  startTimer: () => void;
  canResend: boolean;
  countdown: number;
}) {
  const validateOtp = () => {
    if (otp.replace(/\s/g, "").length < 6) {
      setErrors({ otp: "Please enter the 6-digit OTP" });
      return false;
    }
    if (otp.replace(/\s/g, "") !== DEMO_OTP) {
      setErrors({ otp: "Incorrect OTP. Use 123456 for demo." });
      return false;
    }
    return true;
  };

  return (
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
                toast.success("OTP resent!");
              }}
              className="text-secondary text-sm font-medium"
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
}

// ─── Forgot Password Screen ───────────────────────────────────────────────────
function ForgotPasswordScreen({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  setErrors,
  navigate,
}: {
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  errors: Record<string, string>;
  setErrors: (e: Record<string, string>) => void;
  navigate: (s: Screen) => void;
}) {
  return (
    <ScreenWrapper>
      <AuthCard
        title="New password"
        subtitle="Create a new password"
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
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
function HomeScreen({
  userName,
  buyQuantity,
  buyAmount,
  sellAmount,
  totalRevenue,
  navigate,
}: {
  userName: string;
  buyQuantity: number;
  buyAmount: number;
  sellAmount: number;
  totalRevenue: number;
  navigate: (s: Screen) => void;
}) {
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBannerIndex((i) => (i + 1) % 2), 3500);
    return () => clearInterval(t);
  }, []);

  const banners = [
    {
      bg: "linear-gradient(135deg, #7c3aed 0%, #db2777 100%)",
      title: "INVITE FRIENDS",
      sub: "To unlock cash benefits",
      btn: "Invite Now",
      emoji: "🎁",
    },
    {
      bg: "linear-gradient(135deg, #0d9488 0%, #0891b2 100%)",
      title: "Buy RP Coins",
      sub: "Safe · Fast · Convenient",
      btn: "Buy Now",
      emoji: "🪙",
    },
  ];

  const statsItems = [
    {
      label: "Buy Quantity",
      value: buyQuantity.toString(),
      icon: "🛒",
      sub: "transactions",
    },
    {
      label: "Buy Amount",
      value: `₹${buyAmount.toFixed(1)}`,
      icon: "💰",
      sub: "spent",
    },
    {
      label: "Sell Amount",
      value: `₹${sellAmount.toFixed(1)}`,
      icon: "💱",
      sub: "received",
    },
    {
      label: "Total Revenue",
      value: `₹${totalRevenue.toFixed(1)}`,
      icon: "📈",
      sub: "earned",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-3 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img
            src="/assets/generated/wynpay-logo-transparent.dim_512x512.png"
            alt="WynPay"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-bold gold-text">wynpay</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            Hi, {userName.split(" ")[0]} 👋
          </span>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 space-y-4 overflow-y-auto pt-3">
        {/* Banner Carousel */}
        <div
          className="relative rounded-2xl overflow-hidden h-32"
          data-ocid="home.banner.panel"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={bannerIndex}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-between px-6"
              style={{ background: banners[bannerIndex].bg }}
            >
              <div className="text-white">
                <div className="text-lg font-black leading-tight">
                  {banners[bannerIndex].title}
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  {banners[bannerIndex].sub}
                </div>
                <button
                  type="button"
                  className="mt-2 px-4 py-1.5 bg-white/25 hover:bg-white/35 text-white text-xs font-bold rounded-full transition-colors"
                  data-ocid="home.banner.button"
                >
                  {banners[bannerIndex].btn}
                </button>
              </div>
              <div className="text-5xl">{banners[bannerIndex].emoji}</div>
            </motion.div>
          </AnimatePresence>
          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {[0, 1].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setBannerIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  bannerIndex === i ? "bg-white w-4" : "bg-white/50"
                }`}
                data-ocid={`home.banner.pagination.${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Newcomer Bonus Card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between"
          data-ocid="home.newcomer_bonus.card"
        >
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">
              🎉 Welcome Offer
            </p>
            <h3 className="text-base font-black text-gray-800 mt-0.5">
              Newcomer Bonus
            </h3>
            <p className="text-blue-600 font-bold text-sm">Up to Rs. 800!</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("newcomer-bonus")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-full transition-colors"
            data-ocid="home.newcomer_bonus.button"
          >
            Click to enter
          </button>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          data-ocid="home.stats.card"
        >
          <div className="grid grid-cols-2 gap-3">
            {statsItems.map((item, idx) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-2 rounded-xl bg-gray-50"
                data-ocid={`home.stats.item.${idx + 1}`}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 truncate">{item.label}</p>
                  <p className="text-base font-black text-gray-800">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-3 w-full text-right text-xs text-blue-600 font-semibold"
            data-ocid="home.stats.more.button"
          >
            More &gt;
          </button>
        </motion.div>

        {/* Tutorial */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <h3 className="text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">
            Tutorial
          </h3>
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4"
            data-ocid="home.tutorial.card"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl flex-shrink-0">
              📖
            </div>
            <div>
              <p className="font-bold text-gray-800">Purchase Introduction</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Learn how to buy &amp; sell RP coins safely
              </p>
            </div>
            <ShoppingCart
              size={18}
              className="ml-auto text-gray-300 flex-shrink-0"
            />
          </div>
        </motion.div>

        {/* Rewards shortcut */}
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            type="button"
            onClick={() => navigate("rewards")}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
            data-ocid="home.earn_rp.button"
          >
            <span className="text-2xl">🪙</span>
            <div className="text-left">
              <p className="font-black text-white text-sm">Earn RP Coins</p>
              <p className="text-xs text-white/80">
                Complete tasks to earn rewards
              </p>
            </div>
            <TrendingUp size={18} className="ml-auto text-white/80" />
          </button>
        </motion.div>
      </main>

      <BottomNav active="home" onNavigate={navigate} />

      <div className="pb-20" />
      <footer className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] text-center pb-1">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </motion.div>
  );
}

// ─── Rewards Screen ───────────────────────────────────────────────────────────
function RewardsScreen({
  rpCoins,
  navigate,
}: {
  rpCoins: number;
  navigate: (s: Screen) => void;
}) {
  const tasks = [
    { coins: 10, label: "Order Rewards", progress: 0, target: 10 },
    { coins: 30, label: "Order Rewards", progress: 0, target: 30 },
    { coins: 50, label: "Order Rewards", progress: 0, target: 50 },
    { coins: 100, label: "Order Rewards", progress: 0, target: 100 },
    { coins: 100, label: "Order Rewards", progress: 0, target: 150 },
    { coins: 100, label: "Order Rewards", progress: 0, target: 200 },
    { coins: 800, label: "Total purchase reward", progress: 0, target: 300000 },
    {
      coins: 1000,
      label: "Total purchase reward",
      progress: 0,
      target: 500000,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      {/* Header */}
      <div
        className="pt-10 pb-6 px-4 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(160deg, #dbeafe 0%, #e0f2fe 50%, #f0f9ff 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center"
            data-ocid="rewards.back.button"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-gray-600 font-semibold">Earn RP</span>
          <span className="text-lg">🪙</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-5xl font-black text-gray-800">{rpCoins}</p>
            <p className="text-sm text-gray-500 mt-1">Total RP Coins</p>
          </div>
          <div className="text-6xl opacity-60">🗂️</div>
        </div>
      </div>

      <main className="flex-1 px-4 pb-24 pt-4 overflow-y-auto">
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100"
          data-ocid="rewards.daily_tasks.card"
        >
          <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <h2 className="font-black text-gray-800">Daily Tasks</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {tasks.map((task, i) => (
              <div
                key={task.target}
                className="flex items-center gap-3 px-4 py-3"
                data-ocid={`rewards.task.item.${i + 1}`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg, #fce7f3, #ede9fe)",
                  }}
                >
                  <span className="text-base">🪙</span>
                  <span className="text-xs font-black text-purple-700">
                    +{task.coins >= 1000 ? `${task.coins / 1000}K` : task.coins}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-700 truncate">
                    {task.label}
                  </p>
                  <p className="text-xs text-gray-400">
                    {task.progress}/{task.target}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toast("Task not yet complete", { icon: "⏳" })}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full transition-colors flex-shrink-0"
                  data-ocid={`rewards.receive.button.${i + 1}`}
                >
                  Receive
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav active="rewards" onNavigate={navigate} />
    </motion.div>
  );
}

// ─── Newcomer Bonus Screen ────────────────────────────────────────────────────
function NewcomerBonusScreen({
  buyQuantity,
  buyAmount,
  navigate,
}: {
  buyQuantity: number;
  buyAmount: number;
  navigate: (s: Screen) => void;
}) {
  const qtyProgress = (buyQuantity / 10) * 100;
  const amtProgress = (buyAmount / 5000) * 100;
  const canClaim = buyQuantity >= 10 && buyAmount >= 5000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      <div className="px-4 pt-10 pb-4 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
          data-ocid="newcomer.back.button"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <h1 className="font-black text-gray-800 text-lg">Newcomer Bonus</h1>
      </div>

      <main className="flex-1 px-4 py-6 space-y-5">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white text-center">
          <div className="text-5xl mb-3">🎁</div>
          <h2 className="text-2xl font-black">400 Tokens</h2>
          <p className="text-sm opacity-90 mt-1">
            Complete both conditions to claim your reward!
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-700 text-sm text-center">
            Complete <strong>10 buy transactions</strong> AND spend{" "}
            <strong>Rs. 5000</strong> to claim your <strong>400 token</strong>{" "}
            reward!
          </p>
        </div>

        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5"
          data-ocid="newcomer.progress.card"
        >
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                🛒 Buy Quantity
              </span>
              <span className="text-sm font-bold text-blue-600">
                {buyQuantity} / 10 transactions
              </span>
            </div>
            <Progress
              value={qtyProgress}
              className="h-3 rounded-full"
              data-ocid="newcomer.qty_progress.panel"
            />
            <p className="text-xs text-gray-400 mt-1">
              {10 - buyQuantity} more transactions needed
            </p>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                💰 Buy Amount
              </span>
              <span className="text-sm font-bold text-blue-600">
                ₹{buyAmount.toFixed(0)} / ₹5,000
              </span>
            </div>
            <Progress
              value={amtProgress}
              className="h-3 rounded-full"
              data-ocid="newcomer.amount_progress.panel"
            />
            <p className="text-xs text-gray-400 mt-1">
              ₹{(5000 - buyAmount).toFixed(0)} more spending needed
            </p>
          </div>
        </div>

        <Button
          disabled={!canClaim}
          className={`w-full h-14 rounded-2xl text-lg font-black transition-all ${
            canClaim
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          data-ocid="newcomer.claim.button"
        >
          {canClaim ? "🎉 Claim 400 Tokens" : "🔒 Claim 400 Tokens"}
        </Button>
      </main>
    </motion.div>
  );
}

// ─── Buy RP Screen ────────────────────────────────────────────────────────────
function BuyRPScreen({
  navigate,
  setBuyQuantity,
  setBuyAmount,
  setRpCoins,
}: {
  navigate: (s: Screen) => void;
  setBuyQuantity: React.Dispatch<React.SetStateAction<number>>;
  setBuyAmount: React.Dispatch<React.SetStateAction<number>>;
  setRpCoins: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [confirmItem, setConfirmItem] = useState<{
    amount: number;
    reward: number;
  } | null>(null);

  const handleConfirm = () => {
    if (!confirmItem) return;
    setBuyQuantity((prev) => prev + 1);
    setBuyAmount((prev) => prev + confirmItem.amount);
    setRpCoins((prev) => prev + confirmItem.reward);
    toast.success(`+${confirmItem.reward} RP added to your balance! 🎉`);
    setConfirmItem(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
      data-ocid="buy_rp.page"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-4 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center"
          data-ocid="buy_rp.back.button"
        >
          <ArrowLeft size={16} className="text-amber-600" />
        </button>
        <div className="flex-1">
          <h1 className="font-black text-gray-800 text-lg">Buy RP Coins</h1>
          <p className="text-xs text-gray-400 font-medium">
            Choose a level and purchase amount to earn RP coins instantly
          </p>
        </div>
      </header>

      {/* Level cards */}
      <main className="flex-1 px-4 pb-28 overflow-y-auto space-y-3">
        {LEVELS.map((level, li) => (
          <div
            key={level.label}
            className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden"
            data-ocid={`buy_rp.item.${li + 1}`}
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400">
              <span className="text-white font-black text-sm tracking-wide">
                {level.label}
              </span>
              <div className="h-px flex-1 bg-white/30" />
              <span className="text-white/80 text-xs font-medium">
                {level.options[0].reward}–{level.options[1].reward} RP
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3">
              {level.options.map((opt, oi) => (
                <button
                  key={opt.amount}
                  type="button"
                  onClick={() => setConfirmItem(opt)}
                  className="flex flex-col items-center gap-1 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 active:scale-95 transition-all py-3 px-2"
                  data-ocid={`buy_rp.item.${li + 1}.button.${oi + 1}`}
                >
                  <span className="text-gray-800 font-black text-base">
                    ₹{opt.amount.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 rounded-full px-2 py-0.5">
                    +{opt.reward} RP
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </main>

      {/* Confirm Dialog */}
      {confirmItem && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          data-ocid="buy_rp.dialog"
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="bg-white rounded-t-3xl w-full max-w-[430px] p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🪙</div>
              <h3 className="font-black text-gray-800 text-xl mb-1">
                Confirm Purchase
              </h3>
              <p className="text-gray-500 text-sm">
                Buy{" "}
                <span className="font-bold text-gray-700">
                  ₹{confirmItem.amount.toLocaleString("en-IN")}
                </span>{" "}
                to earn
              </p>
              <p className="text-2xl font-black text-amber-500 mt-1">
                +{confirmItem.reward} RP
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmItem(null)}
                className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                data-ocid="buy_rp.cancel.button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl font-black text-white bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 transition-all shadow-md"
                data-ocid="buy_rp.confirm.button"
              >
                Confirm Buy
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <BottomNav active="buy-rp" onNavigate={navigate} />
    </motion.div>
  );
}

// ─── Placeholder Screen ───────────────────────────────────────────────────────
function PlaceholderScreen({
  title,
  emoji,
  activeNav,
  navigate,
}: {
  title: string;
  emoji: string;
  activeNav: Screen;
  navigate: (s: Screen) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      <header className="px-4 pt-10 pb-3 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate("home")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <span className="font-black text-gray-800">{title}</span>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center gap-4 pb-24">
        <div className="text-7xl">{emoji}</div>
        <h2 className="text-2xl font-black text-gray-700">Coming Soon</h2>
        <p className="text-gray-400 text-center px-8">
          This feature is being built. Stay tuned for updates!
        </p>
        <div className="mt-2 px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-amber-400 to-yellow-500">
          🚀 Launching soon
        </div>
      </main>
      <BottomNav active={activeNav} onNavigate={navigate} />
    </motion.div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userName, setUserName] = useState("Alex Johnson");

  const [buyQuantity, setBuyQuantity] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);
  const [rpCoins, setRpCoins] = useState(0);
  const [sellAmount] = useState(600.0);
  const [totalRevenue] = useState(0);

  const { countdown, canResend, startTimer } = useOtpTimer();

  const navigate = useCallback((s: Screen) => {
    setOtp("");
    setErrors({});
    setScreen(s);
  }, []);

  const sendOtp = useCallback(
    (nextScreen: Screen) => {
      startTimer();
      navigate(nextScreen);
      toast.success("OTP sent! For demo: use code 123456", {
        duration: 5000,
        icon: "📱",
      });
    },
    [startTimer, navigate],
  );

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
        {screen === "splash" && (
          <SplashScreen key="splash" navigate={navigate} />
        )}
        {screen === "login-phone" && (
          <LoginPhoneScreen
            key="login-phone"
            phone={phone}
            setPhone={setPhone}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            sendOtp={sendOtp}
          />
        )}
        {screen === "login-otp" && (
          <LoginOtpScreen
            key="login-otp"
            phone={phone}
            otp={otp}
            setOtp={setOtp}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            startTimer={startTimer}
            canResend={canResend}
            countdown={countdown}
          />
        )}
        {screen === "signup-details" && (
          <SignupDetailsScreen
            key="signup-details"
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            sendOtp={sendOtp}
            setUserName={setUserName}
          />
        )}
        {screen === "signup-otp" && (
          <SignupOtpScreen
            key="signup-otp"
            phone={phone}
            otp={otp}
            setOtp={setOtp}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            startTimer={startTimer}
            canResend={canResend}
            countdown={countdown}
          />
        )}
        {screen === "signup-password" && (
          <SignupPasswordScreen
            key="signup-password"
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            name={name}
          />
        )}
        {screen === "forgot-phone" && (
          <ForgotPhoneScreen
            key="forgot-phone"
            phone={phone}
            setPhone={setPhone}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            sendOtp={sendOtp}
          />
        )}
        {screen === "forgot-otp" && (
          <ForgotOtpScreen
            key="forgot-otp"
            phone={phone}
            otp={otp}
            setOtp={setOtp}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
            startTimer={startTimer}
            canResend={canResend}
            countdown={countdown}
          />
        )}
        {screen === "forgot-password" && (
          <ForgotPasswordScreen
            key="forgot-password"
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            errors={errors}
            setErrors={setErrors}
            navigate={navigate}
          />
        )}
        {screen === "home" && (
          <HomeScreen
            key="home"
            userName={userName}
            buyQuantity={buyQuantity}
            buyAmount={buyAmount}
            sellAmount={sellAmount}
            totalRevenue={totalRevenue}
            navigate={navigate}
          />
        )}
        {screen === "rewards" && (
          <RewardsScreen key="rewards" rpCoins={rpCoins} navigate={navigate} />
        )}
        {screen === "newcomer-bonus" && (
          <NewcomerBonusScreen
            key="newcomer-bonus"
            buyQuantity={buyQuantity}
            buyAmount={buyAmount}
            navigate={navigate}
          />
        )}
        {screen === "buy-rp" && (
          <BuyRPScreen
            key="buy-rp"
            navigate={navigate}
            setBuyQuantity={setBuyQuantity}
            setBuyAmount={setBuyAmount}
            setRpCoins={setRpCoins}
          />
        )}
        {screen === "sell-rp" && (
          <PlaceholderScreen
            key="sell-rp"
            title="Sell RP"
            emoji="💱"
            activeNav="sell-rp"
            navigate={navigate}
          />
        )}
        {screen === "mine" && (
          <PlaceholderScreen
            key="mine"
            title="My Profile"
            emoji="👤"
            activeNav="mine"
            navigate={navigate}
          />
        )}
      </AnimatePresence>

      {screen === "splash" && (
        <footer className="fixed bottom-4 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      )}
    </div>
  );
}
