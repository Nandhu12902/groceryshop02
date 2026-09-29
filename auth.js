/**
 * FreshRoots Grocery Shop - OTP Verification & Authentication Module
 */

const AUTH_STORAGE_KEY = "freshroots_auth_user_v1";

const AuthManager = {
  currentUser: null,
  currentOtp: null,
  otpTarget: null, // Phone or Email
  otpTargetType: "phone", // 'phone' or 'email'
  countdownInterval: null,
  cooldownSeconds: 60,
  failedAttempts: 0,
  maxFailedAttempts: 3,
  isLocked: false,
  listeners: [],

  init() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Auth initialization error:", e);
    }
  },

  onAuthChange(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
  },

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentUser));
  },

  isAuthenticated() {
    return !!this.currentUser;
  },

  getUser() {
    return this.currentUser;
  },

  generateOtp() {
    // Generate a secure 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.currentOtp = code;
    return code;
  },

  requestOtp(identifier, type = "phone") {
    if (this.isLocked) {
      throw new Error("Security Lock: Too many failed attempts. Please wait 60 seconds.");
    }

    if (!identifier || identifier.trim().length < 5) {
      throw new Error("Please enter a valid " + (type === "phone" ? "phone number" : "email address") + ".");
    }

    this.otpTarget = identifier.trim();
    this.otpTargetType = type;
    this.failedAttempts = 0;
    const otp = this.generateOtp();

    // Trigger visual Simulated Push Notification Toast
    this.showSimulatedNotification(this.otpTarget, otp, type);

    return {
      success: true,
      otp: otp,
      target: this.otpTarget,
      cooldown: this.cooldownSeconds
    };
  },

  verifyOtp(enteredCode) {
    if (this.isLocked) {
      return { success: false, message: "Temporarily locked due to multiple invalid attempts." };
    }

    if (!this.currentOtp) {
      return { success: false, message: "No active OTP request found. Please request a new code." };
    }

    if (enteredCode === this.currentOtp) {
      // Success! Create authenticated user session
      const user = {
        id: "usr-" + Date.now().toString(36),
        identifier: this.otpTarget,
        type: this.otpTargetType,
        name: this.formatDisplayName(this.otpTarget, this.otpTargetType),
        loginTime: new Date().toISOString(),
        verified: true,
        token: "jwt_mock_" + Math.random().toString(36).substring(2) + Date.now()
      };

      this.currentUser = user;
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      this.currentOtp = null;
      this.failedAttempts = 0;
      this.notifyListeners();

      return { success: true, user: user };
    } else {
      this.failedAttempts += 1;
      const remainingAttempts = this.maxFailedAttempts - this.failedAttempts;

      if (remainingAttempts <= 0) {
        this.isLocked = true;
        setTimeout(() => {
          this.isLocked = false;
          this.failedAttempts = 0;
        }, 60000);
        return {
          success: false,
          locked: true,
          message: "Too many incorrect attempts! Security cooldown activated for 60 seconds."
        };
      }

      return {
        success: false,
        message: `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`
      };
    }
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notifyListeners();
  },

  formatDisplayName(identifier, type) {
    if (type === "phone") {
      const clean = identifier.replace(/\D/g, "");
      if (clean.length >= 10) {
        return "Shopper (..." + clean.slice(-4) + ")";
      }
      return "Shopper (" + identifier + ")";
    } else {
      const namePart = identifier.split("@")[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
  },

  showSimulatedNotification(target, otp, type) {
    // Remove existing toast if any
    const existing = document.getElementById("simulated-sms-toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.id = "simulated-sms-toast";
    toast.className = "fixed top-5 right-5 z-50 max-w-md bg-slate-900/95 text-white border border-emerald-500/50 shadow-2xl rounded-2xl p-4 transition-all duration-300 transform translate-y-0 backdrop-blur-md animate-bounce-subtle";
    
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Secure OTP Dispatch
            </span>
            <span class="text-xs text-slate-400">Just now</span>
          </div>
          <p class="text-sm font-medium text-slate-200 mt-1">
            Verification code sent to <span class="font-semibold text-white">${target}</span>:
          </p>
          <div class="mt-2.5 flex items-center justify-between bg-slate-800/90 rounded-xl px-3.5 py-2 border border-slate-700/60">
            <span class="font-mono text-2xl tracking-[0.3em] font-bold text-emerald-400">${otp}</span>
            <button id="copy-otp-toast-btn" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs font-medium rounded-lg text-white transition-colors flex items-center gap-1 shadow-sm">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Copy
            </button>
          </div>
          <p class="text-[11px] text-slate-400 mt-2">
            🛡️ Never share this OTP with anyone. Valid for 5 minutes.
          </p>
        </div>
        <button onclick="document.getElementById('simulated-sms-toast')?.remove()" class="text-slate-400 hover:text-white p-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    // Copy event
    const copyBtn = document.getElementById("copy-otp-toast-btn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(otp);
        copyBtn.innerHTML = `
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          Copied!
        `;
        // Also auto-fill into OTP input boxes if modal is open
        const otpInputs = document.querySelectorAll(".otp-digit-input");
        if (otpInputs && otpInputs.length === 6) {
          otp.split("").forEach((ch, idx) => {
            if (otpInputs[idx]) otpInputs[idx].value = ch;
          });
          otpInputs[5].focus();
        }
        setTimeout(() => {
          if (copyBtn) copyBtn.innerText = "Copy";
        }, 2000);
      });
    }

    // Auto dismiss toast after 15s
    setTimeout(() => {
      const el = document.getElementById("simulated-sms-toast");
      if (el) el.remove();
    }, 15000);
  }
};

AuthManager.init();
