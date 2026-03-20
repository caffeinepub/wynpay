import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Toaster } from "@/components/ui/sonner";
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Gift,
  Grid2x2,
  Headphones,
  HelpCircle,
  Home,
  Loader2,
  Lock,
  LogOut,
  Plus,
  Send,
  ShoppingCart,
  Smartphone,
  Trash2,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
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

// ─── UPI Wallet Types ────────────────────────────────────────────────────────
type UpiWalletType = "PhonePe" | "Paytm" | "MobiKwik" | "FreeCharge";
interface UpiWallet {
  id: string;
  name: UpiWalletType;
  upiId: string;
}
interface SellTransaction {
  id: string;
  date: string;
  walletName: string;
  amount: number;
}

const WALLET_COLORS: Record<UpiWalletType, string> = {
  PhonePe: "#5f259f",
  Paytm: "#00b9f1",
  MobiKwik: "#e40046",
  FreeCharge: "#f26522",
};
const WALLET_EMOJIS: Record<UpiWalletType, string> = {
  PhonePe: "📱",
  Paytm: "💳",
  MobiKwik: "📲",
  FreeCharge: "⚡",
};

const _LEVELS = [
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
            src="/assets/generated/wynpay-logo-transparent.dim_400x400.png"
            alt="WynPay"
            className="w-48 h-48 object-contain mb-4"
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
            src="/assets/generated/wynpay-logo-transparent.dim_400x400.png"
            alt="WynPay"
            className="w-64 h-64 object-contain"
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
            src="/assets/generated/wynpay-logo-transparent.dim_400x400.png"
            alt="WynPay"
            className="w-20 h-20 object-contain"
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

// ─── Buy RP Transaction Data ─────────────────────────────────────────────────
const ALL_LEVELS = [
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

function generateId(): string {
  return String(Math.floor(1000000000 + Math.random() * 9000000000));
}

type TxEntry = {
  id: string;
  payment: number;
  award: number;
  received: boolean;
};

const LEVEL_TRANSACTIONS: TxEntry[][] = ALL_LEVELS.map((lv) => {
  const entries: TxEntry[] = [];
  for (let i = 0; i < 9; i++) {
    const opt = lv.options[i % 2];
    entries.push({
      id: generateId(),
      payment: opt.amount,
      award: opt.reward,
      received: false,
    });
  }
  return entries;
});

// ─── UPI Payment Modal ────────────────────────────────────────────────────────
const UPI_IDS = ["Chanchal.68@ybl", "Chanchal.68@ibl", "Chanchal.68@axl"];

function UpiPaymentModal({
  payment,
  onPay,
  onCancel,
}: {
  payment: number;
  onPay: () => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"choose" | "processing" | "success">(
    "choose",
  );
  const [timeLeft, setTimeLeft] = useState(120);
  const proceededRef = useRef(false);
  const onPayRef = useRef(onPay);
  onPayRef.current = onPay;

  const handleProceed = useCallback(async () => {
    if (proceededRef.current) return;
    proceededRef.current = true;
    setStep("processing");
    await new Promise((r) => setTimeout(r, 1500));
    setStep("success");
    await new Promise((r) => setTimeout(r, 1000));
    onPayRef.current();
  }, []);

  useEffect(() => {
    if (step !== "choose") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleProceed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, handleProceed]);

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi).catch(() => {});
    toast.success("Copied!");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget && step === "choose") onCancel();
      }}
    >
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 280 }}
        className="w-full max-w-sm bg-white rounded-t-3xl overflow-hidden shadow-2xl"
      >
        {/* PhonePe Header */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ background: "#5f259f" }}
        >
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            <Smartphone size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-base leading-none">
              PhonePe
            </p>
            <p className="text-white/70 text-xs">UPI Payment</p>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-6">
          {step === "choose" && (
            <>
              {/* Amount */}
              <div className="text-center mb-5">
                <p className="text-gray-500 text-sm mb-1">Pay Amount</p>
                <p className="text-3xl font-extrabold text-gray-900">
                  Rs. {payment}
                </p>
              </div>

              {/* UPI IDs */}
              <div className="mb-5">
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  Send money to
                </p>
                <div className="space-y-2">
                  {UPI_IDS.map((upi, i) => (
                    <div
                      key={upi}
                      className="flex items-center gap-3 bg-purple-50 rounded-xl px-3 py-2.5"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: "#5f259f" }}
                      >
                        {i + 1}
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                        {upi}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyUpi(upi)}
                        className="text-purple-600 hover:text-purple-800 transition-colors flex-shrink-0"
                        title="Copy UPI ID"
                      >
                        <Copy size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500 font-medium">
                    Auto-checking payment
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ color: "#5f259f" }}
                  >
                    {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:
                    {String(timeLeft % 60).padStart(2, "0")}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      background: "#5f259f",
                      width: `${(timeLeft / 120) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Payment verification in progress...
                </p>
              </div>
              <button
                type="button"
                onClick={onCancel}
                className="w-full mt-3 py-2 text-gray-400 text-sm font-medium"
                data-ocid="upi_payment.cancel_button"
              >
                Cancel
              </button>
            </>
          )}

          {step === "processing" && (
            <div
              className="flex flex-col items-center py-10 gap-4"
              data-ocid="upi_payment.loading_state"
            >
              <Loader2
                size={48}
                className="animate-spin"
                style={{ color: "#5f259f" }}
              />
              <p className="text-gray-700 font-semibold text-base">
                Processing payment...
              </p>
              <p className="text-gray-400 text-sm">Please wait</p>
            </div>
          )}

          {step === "success" && (
            <div
              className="flex flex-col items-center py-10 gap-3"
              data-ocid="upi_payment.success_state"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CheckCircle size={56} className="text-green-500" />
              </motion.div>
              <p className="text-gray-800 font-bold text-xl">
                Payment Successful!
              </p>
              <p className="text-gray-500 text-sm text-center">
                Your RP will be credited shortly
              </p>
            </div>
          )}
        </div>
      </motion.div>
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
  const [activeLevel, setActiveLevel] = useState(0);
  const [payingTx, setPayingTx] = useState<{
    idx: number;
    payment: number;
    award: number;
  } | null>(null);
  const [txData, setTxData] = useState<TxEntry[][]>(() =>
    LEVEL_TRANSACTIONS.map((lvl) => lvl.map((tx) => ({ ...tx }))),
  );

  const handleReceive = (txIdx: number) => {
    const tx = txData[activeLevel][txIdx];
    if (tx.received) return;
    setBuyQuantity((prev) => prev + 1);
    setBuyAmount((prev) => prev + tx.payment);
    setRpCoins((prev) => prev + tx.award);
    toast.success(`+${tx.award} RP received! 🎉`);
    setTxData((prev) => {
      const next = prev.map((lvl) => lvl.map((t) => ({ ...t })));
      next[activeLevel][txIdx].received = true;
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-slate-900"
      data-ocid="buy_rp.page"
    >
      {/* Teal header with level tabs */}
      <header
        className="pt-10 pb-0 flex flex-col gap-0"
        style={{ background: "#0f766e" }}
      >
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            type="button"
            onClick={() => navigate("home")}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            data-ocid="buy_rp.back.button"
          >
            <ArrowLeft size={16} className="text-white" />
          </button>
          <h1 className="flex-1 font-bold text-white text-base">Buy RP</h1>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            data-ocid="buy_rp.list.button"
          >
            <TrendingUp size={16} className="text-white" />
          </button>
        </div>
        {/* Level tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {ALL_LEVELS.map((lv, i) => (
            <button
              key={lv.label}
              type="button"
              onClick={() => setActiveLevel(i)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeLevel === i
                  ? "bg-white text-teal-800"
                  : "bg-transparent border border-white/50 text-white hover:bg-white/10"
              }`}
              data-ocid={`buy_rp.tab.${i + 1}`}
            >
              {lv.label}
            </button>
          ))}
        </div>
      </header>

      {/* Transaction list */}
      <main className="flex-1 overflow-y-auto pb-24 px-3 pt-3 space-y-2 bg-slate-900">
        {txData[activeLevel].map((tx, idx) => (
          <div
            key={tx.id}
            className="bg-slate-800 rounded-xl shadow-sm px-4 py-3 border border-slate-700"
            data-ocid={`buy_rp.item.${idx + 1}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white text-sm truncate max-w-[60%]">
                ID: {tx.id}...
              </span>
              <button
                type="button"
                onClick={() =>
                  !tx.received &&
                  setPayingTx({ idx, payment: tx.payment, award: tx.award })
                }
                disabled={tx.received}
                className={`px-4 py-1 rounded-full border text-xs font-semibold transition-all ${
                  tx.received
                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "border-teal-600 text-teal-600 hover:bg-teal-50 active:scale-95"
                }`}
                data-ocid={`buy_rp.item.${idx + 1}.button`}
              >
                {tx.received ? "Received" : "Receive"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Payment Amount:{" "}
                <span className="font-medium text-teal-300">
                  Rs. {tx.payment}
                </span>
              </span>
              <span className="text-xs text-slate-400">
                Award:{" "}
                <span className="font-medium text-amber-400">
                  Rs. {tx.award}
                </span>
              </span>
            </div>
          </div>
        ))}
      </main>

      <AnimatePresence>
        {payingTx !== null && (
          <UpiPaymentModal
            payment={payingTx.payment}
            onPay={() => {
              handleReceive(payingTx.idx);
              setPayingTx(null);
            }}
            onCancel={() => setPayingTx(null)}
          />
        )}
      </AnimatePresence>
      <BottomNav active="buy-rp" onNavigate={navigate} />
    </motion.div>
  );
}

// ─── Placeholder Screen ───────────────────────────────────────────────────────
// ─── Sell RP Screen ──────────────────────────────────────────────────────────
function SellRPScreen({
  navigate,
  upiWallets,
  setUpiWallets,
  sellTransactions,
}: {
  navigate: (s: Screen) => void;
  upiWallets: UpiWallet[];
  setUpiWallets: React.Dispatch<React.SetStateAction<UpiWallet[]>>;
  sellTransactions: SellTransaction[];
}) {
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [selectedWalletType, setSelectedWalletType] =
    useState<UpiWalletType | null>(null);
  const [upiInput, setUpiInput] = useState("");
  const [addError, setAddError] = useState("");

  const todayTotal = sellTransactions
    .filter((tx) => {
      const today = new Date().toDateString();
      return new Date(tx.date).toDateString() === today;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleAddWallet = () => {
    if (!selectedWalletType) {
      setAddError("Please select a wallet type.");
      return;
    }
    if (!upiInput.trim()) {
      setAddError("Please enter your UPI ID.");
      return;
    }
    const newWallet: UpiWallet = {
      id: Date.now().toString(),
      name: selectedWalletType,
      upiId: upiInput.trim(),
    };
    setUpiWallets((prev) => [...prev, newWallet]);
    setShowAddWallet(false);
    setSelectedWalletType(null);
    setUpiInput("");
    setAddError("");
    toast.success(`${selectedWalletType} wallet added!`);
  };

  const handleDeleteWallet = (id: string) => {
    setUpiWallets((prev) => prev.filter((w) => w.id !== id));
    toast.success("Wallet removed.");
  };

  const walletTypes: UpiWalletType[] = [
    "PhonePe",
    "Paytm",
    "MobiKwik",
    "FreeCharge",
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-50"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-3 bg-white shadow-sm flex items-center gap-3">
        <button
          type="button"
          data-ocid="sell_rp.back.button"
          onClick={() => navigate("home")}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <span className="font-black text-gray-800 text-lg">Sell RP</span>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-5">
        {/* Today's Overview Card */}
        <div
          className="rounded-2xl p-4 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #e8f4fd 0%, #dbeeff 100%)",
          }}
        >
          <p className="text-center text-sm font-bold text-gray-600 mb-3">
            Today's Overview
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Amount of receipt:</p>
              <p className="text-3xl font-black text-gray-800">
                ₹{todayTotal.toFixed(2)}
              </p>
            </div>
            <button
              type="button"
              data-ocid="sell_rp.record.button"
              onClick={() => setShowRecords(true)}
              className="px-4 py-2 rounded-xl border-2 text-sm font-bold"
              style={{ borderColor: "#008080", color: "#008080" }}
            >
              Record
            </button>
          </div>
        </div>

        {/* Wallet Information */}
        <div>
          <h3 className="text-sm font-black text-gray-700 mb-3 px-1">
            Wallet Information
          </h3>

          {upiWallets.length === 0 ? (
            <div
              className="bg-white rounded-2xl shadow-sm flex flex-col items-center justify-center py-10 gap-2"
              data-ocid="sell_rp.wallets.empty_state"
            >
              <div className="text-5xl">📦</div>
              <p className="text-sm text-gray-400">
                There is currently no data
              </p>
            </div>
          ) : (
            <div className="space-y-3" data-ocid="sell_rp.wallets.list">
              {upiWallets.map((wallet, idx) => (
                <div
                  key={wallet.id}
                  data-ocid={`sell_rp.wallet.item.${idx + 1}`}
                  className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0"
                    style={{ backgroundColor: WALLET_COLORS[wallet.name] }}
                  >
                    {WALLET_EMOJIS[wallet.name]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">
                      {wallet.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {wallet.upiId}
                    </p>
                  </div>
                  <button
                    type="button"
                    data-ocid={`sell_rp.wallet.delete_button.${idx + 1}`}
                    onClick={() => handleDeleteWallet(wallet.id)}
                    className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Wallet Button */}
        <button
          type="button"
          data-ocid="sell_rp.add_wallet.button"
          onClick={() => setShowAddWallet(true)}
          className="w-full bg-white rounded-2xl shadow-sm px-4 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "#008080" }}
          >
            <Plus size={20} className="text-white" />
          </div>
          <span className="font-bold text-gray-700">Add Wallet</span>
        </button>
      </main>

      <BottomNav active="sell-rp" onNavigate={navigate} />

      {/* Add Wallet Modal */}
      {showAddWallet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          data-ocid="sell_rp.add_wallet.modal"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowAddWallet(false);
              setAddError("");
            }}
          />
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 bg-white w-full max-w-[430px] rounded-t-3xl p-5 pb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-800">
                Add UPI Wallet
              </h3>
              <button
                type="button"
                data-ocid="sell_rp.add_wallet.close_button"
                onClick={() => {
                  setShowAddWallet(false);
                  setAddError("");
                }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {walletTypes.map((wt) => (
                <button
                  key={wt}
                  type="button"
                  data-ocid={`sell_rp.wallet_type.${wt.toLowerCase()}.button`}
                  onClick={() => setSelectedWalletType(wt)}
                  className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 transition-all ${
                    selectedWalletType === wt
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ backgroundColor: WALLET_COLORS[wt] }}
                  >
                    {WALLET_EMOJIS[wt]}
                  </div>
                  <span className="text-sm font-bold text-gray-700">{wt}</span>
                </button>
              ))}
            </div>

            <div className="mb-1">
              <label
                htmlFor="upi-id-input"
                className="text-xs font-bold text-gray-600 mb-1 block"
              >
                UPI ID
              </label>
              <input
                type="text"
                id="upi-id-input"
                data-ocid="sell_rp.upi_id.input"
                placeholder={
                  selectedWalletType
                    ? `yourname@${selectedWalletType.toLowerCase()}`
                    : "yourname@upi"
                }
                value={upiInput}
                onChange={(e) => {
                  setUpiInput(e.target.value);
                  setAddError("");
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 transition-colors"
              />
            </div>

            {addError && (
              <p className="text-xs text-red-500 mb-3">{addError}</p>
            )}

            <button
              type="button"
              data-ocid="sell_rp.add_wallet.submit_button"
              onClick={handleAddWallet}
              className="w-full py-3 rounded-xl font-black text-white mt-4"
              style={{ backgroundColor: "#008080" }}
            >
              Add Wallet
            </button>
          </motion.div>
        </div>
      )}

      {/* Records Modal */}
      {showRecords && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          data-ocid="sell_rp.records.modal"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowRecords(false)}
          />
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 bg-white w-full max-w-[430px] rounded-t-3xl p-5 pb-8 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-gray-800">
                Transaction Records
              </h3>
              <button
                type="button"
                data-ocid="sell_rp.records.close_button"
                onClick={() => setShowRecords(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {sellTransactions.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 gap-2"
                  data-ocid="sell_rp.records.empty_state"
                >
                  <div className="text-5xl">📋</div>
                  <p className="text-sm text-gray-400">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sellTransactions.map((tx, idx) => (
                    <div
                      key={tx.id}
                      data-ocid={`sell_rp.transaction.item.${idx + 1}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                    >
                      <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Wallet size={16} className="text-teal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-700">
                          {tx.walletName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.date).toLocaleString()}
                        </p>
                      </div>
                      <p className="font-black text-teal-600 text-sm">
                        +₹{tx.amount.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Mine / Profile Screen ────────────────────────────────────────────────────
function MineScreen({
  buyAmount,
  rpCoins,
  userPhone,
  navigate,
  onLogout,
}: {
  buyAmount: number;
  rpCoins: number;
  userPhone: string;
  navigate: (s: Screen) => void;
  onLogout: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const inviteCode = `WYN${userPhone ? userPhone.slice(-4) : "0000"}`;
  const currentBalance = buyAmount + rpCoins;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Invite code copied!");
  };

  const menuItems = [
    {
      icon: <Gift size={18} className="text-amber-500" />,
      label: "Newbie Rewards",
    },
    {
      icon: <Grid2x2 size={18} className="text-teal-600" />,
      label: "Bind Payment App",
    },
    {
      icon: <HelpCircle size={18} className="text-blue-500" />,
      label: "Common Problem",
    },
    {
      icon: <Headphones size={18} className="text-purple-500" />,
      label: "Online Service",
    },
    {
      icon: <Lock size={18} className="text-gray-500" />,
      label: "Account Security",
    },
    {
      icon: <Send size={18} className="text-teal-500" />,
      label: "Official Channel",
    },
    {
      icon: <Users size={18} className="text-amber-600" />,
      label: "Superior Relationship",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="min-h-screen flex flex-col max-w-[430px] mx-auto bg-gray-100"
      data-ocid="mine.page"
    >
      {/* Header */}
      <header className="px-4 pt-10 pb-5 bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-teal-500 flex items-center justify-center border-2 border-amber-400/50 shadow-lg">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-400 font-medium tracking-wide mb-0.5">
              MOBILE
            </p>
            <p className="text-white font-bold text-base">
              +91{" "}
              {userPhone
                ? userPhone.replace(/^(\d{5})(\d{5})$/, "$1 $2")
                : "XXXXXXXXXX"}
            </p>
            {/* Invite Code */}
            <div className="mt-2 flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-1.5 w-fit border border-amber-400/20">
              <span className="text-xs text-gray-400">Invite:</span>
              <span className="text-amber-400 font-bold text-sm tracking-widest">
                {inviteCode}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                data-ocid="mine.copy.button"
                className="ml-1 text-teal-400 hover:text-teal-300 transition-colors"
              >
                {copied ? (
                  <span className="text-[10px] text-green-400 font-bold">
                    ✓
                  </span>
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24 space-y-3 pt-3 px-3">
        {/* Current Balance Card */}
        <div
          className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between"
          data-ocid="mine.balance.card"
        >
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">
              Current Balance
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-gray-800">
                ₹{currentBalance.toFixed(2)}
              </span>
            </div>
            <div className="flex gap-3 mt-1.5">
              <span className="text-[11px] text-gray-400">
                Buy:{" "}
                <span className="text-amber-600 font-semibold">
                  ₹{buyAmount.toFixed(0)}
                </span>
              </span>
              <span className="text-[11px] text-gray-400">
                Rewards:{" "}
                <span className="text-teal-600 font-semibold">
                  ₹{rpCoins.toFixed(0)}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
              <Wallet size={18} className="text-white" />
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>

        {/* My Team Card */}
        <div
          className="rounded-2xl overflow-hidden shadow-sm"
          data-ocid="mine.team.card"
        >
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-black text-lg leading-tight">
                My team
              </p>
              <p className="text-teal-200 text-xs mt-0.5">
                3-LEVEL rebate mechanism
              </p>
              <button
                type="button"
                data-ocid="mine.team.button"
                className="mt-2 text-amber-300 text-xs font-bold flex items-center gap-0.5 hover:text-amber-200 transition-colors"
              >
                View earnings <ChevronRight size={13} />
              </button>
            </div>
            <div className="w-16 h-16 rounded-full bg-teal-500/30 flex items-center justify-center">
              <Users size={30} className="text-amber-300" />
            </div>
          </div>
        </div>

        {/* Menu List Card */}
        <div
          className="bg-white rounded-2xl shadow-sm overflow-hidden"
          data-ocid="mine.menu.card"
        >
          {menuItems.map((item, idx) => (
            <div key={item.label}>
              <button
                type="button"
                data-ocid={`mine.menu.item.${idx + 1}`}
                className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <span className="flex-1 text-left text-sm font-medium text-gray-700">
                  {item.label}
                </span>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
              {idx < menuItems.length - 1 && (
                <div className="ml-14 border-b border-gray-100" />
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          data-ocid="mine.logout.button"
          className="w-full py-3.5 rounded-2xl border-2 border-red-400 text-red-500 font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2 bg-white shadow-sm"
        >
          <LogOut size={16} />
          Log Out
        </button>

        {/* Footer */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-500 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>

      <BottomNav active="mine" onNavigate={navigate} />
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
  const [upiWallets, setUpiWallets] = useState<UpiWallet[]>([]);
  const [sellTransactions, _setSellTransactions] = useState<SellTransaction[]>(
    [],
  );

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
          <SellRPScreen
            key="sell-rp"
            navigate={navigate}
            upiWallets={upiWallets}
            setUpiWallets={setUpiWallets}
            sellTransactions={sellTransactions}
          />
        )}
        {screen === "mine" && (
          <MineScreen
            key="mine"
            buyAmount={buyAmount}
            rpCoins={rpCoins}
            userPhone={phone}
            navigate={navigate}
            onLogout={() => navigate("splash")}
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
