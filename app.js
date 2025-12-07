const API_URL = "https://petcare-backend-production-ad73.up.railway.app";

// CRITICAL: Add this helper for all fetch requests
const fetchWithCredentials = (url, options = {}) => {
  return fetch(url, {
    ...options,
    credentials: "include", // CRITICAL: Always include credentials
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
  });
};

const navbar = document.querySelector(".navbar");
const navLinks = document.querySelector(".nav-links");
const menuToggle = document.querySelector(".menu-toggle");
const contactForm = document.getElementById("contactForm");

// Appointment Elements
const bookButton = document.getElementById("bookButton");
const bookMeButton = document.getElementById("bookMeButton");
const formContainer = document.getElementById("appointmentForm");
const petCareForm = document.getElementById("petCareForm");
const successMessage = document.getElementById("successMessage");

// Appointment Cart Elements
const appointmentCart = document.getElementById("appointmentCart");
const appointmentOverlay = document.getElementById("appointmentOverlay");
const closePanel = document.getElementById("closePanel");
const appointmentCount = document.getElementById("appointmentCount");
const appointmentTableBody = document.getElementById("appointmentTableBody");

// =========================
// Global Variables
// =========================
let currentUser = null;
let savedScrollPosition = 0;
let appointmentCounter = 0;
let counterInterval = null;
let appointmentRefreshInterval = null;
let errorCount = 0;

// =========================
// Utility Functions
// =========================
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

function showMessagePopup(message) {
  const popup = document.getElementById("messagePopup");
  const messageEl = document.getElementById("popupMessage");

  if (!popup || !messageEl) {
    console.error("Popup elements not found");
    alert(message);
    return;
  }

  messageEl.textContent = message;
  popup.style.display = "flex";
  popup.style.zIndex = "9999";

  setTimeout(() => {
    popup.style.display = "none";
  }, 3000);
}

async function checkAuthStatus() {
  try {
    const response = await fetchWithCredentials(`${API_URL}/api/check-auth`);

    if (!response.ok) {
      throw new Error("Auth check failed");
    }

    const data = await response.json();

    if (data.isAuthenticated) {
      currentUser = data.user;
      updateUIForUserRole();
      return true;
    }
    return false;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

function updateUIForUserRole() {
  const adminElements = document.querySelectorAll(".admin-only");
  const userElements = document.querySelectorAll(".user-only");

  if (currentUser && currentUser.role === "admin") {
    adminElements.forEach((el) => (el.style.display = "block"));
    userElements.forEach((el) => (el.style.display = "block"));
  } else {
    adminElements.forEach((el) => (el.style.display = "none"));
    userElements.forEach((el) => (el.style.display = "block"));
  }
}

// =========================
// Counter Animation
// =========================
function startCounterAnimation(targetCount) {
  if (counterInterval) {
    clearInterval(counterInterval);
  }

  const increment = targetCount > appointmentCounter ? 1 : -1;
  const speed = Math.min(10, Math.abs(targetCount - appointmentCounter) * 2);

  counterInterval = setInterval(() => {
    appointmentCounter += increment;
    appointmentCount.textContent = appointmentCounter;

    if (
      (increment > 0 && appointmentCounter >= targetCount) ||
      (increment < 0 && appointmentCounter <= targetCount)
    ) {
      clearInterval(counterInterval);
      appointmentCounter = targetCount;
      appointmentCount.textContent = targetCount;
    }
  }, speed);
}

// =========================
// Appointment Management
// =========================
async function updateAppointmentCounter() {
  try {
    const isAuthenticated = await checkAuthStatus();

    if (!isAuthenticated) {
      startCounterAnimation(0);
      errorCount = 0;
      return;
    }

    const response = await fetchWithCredentials(
      `${API_URL}/api/appointments/count`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch count");
    }

    const data = await response.json();
    const count = data.count || 0;

    startCounterAnimation(count);
    errorCount = 0;
  } catch (error) {
    console.error("Counter update error:", error);
    errorCount++;

    const delay = Math.min(1000 * errorCount, 30000);
    await new Promise((resolve) => setTimeout(resolve, delay));

    const stillAuthenticated = await checkAuthStatus();
    if (stillAuthenticated) {
      updateAppointmentCounter();
    } else {
      startCounterAnimation(0);
    }
  }
}

async function loadAppointments(adminView = false) {
  try {
    const isAuthenticated = await checkAuthStatus();

    appointmentTableBody.innerHTML = "";

    if (!isAuthenticated) {
      const loginRow = document.createElement("tr");
      loginRow.innerHTML = `
        <td colspan="6" class="empty-cart">
          Please login to view your appointments
        </td>
      `;
      appointmentTableBody.appendChild(loginRow);
      startCounterAnimation(0);
      return;
    }

    const response = await fetchWithCredentials(`${API_URL}/api/appointments`);

    if (!response.ok) {
      throw new Error("Failed to load appointments");
    }

    const data = await response.json();
    const appointments = data.appointments || [];

    const activeCount = adminView
      ? appointments.filter((a) => a.status === "pending").length
      : appointments.filter((a) => a.status !== "cancelled").length;

    startCounterAnimation(activeCount);
    renderAppointments(
      appointments,
      adminView || (currentUser && currentUser.role === "admin")
    );
  } catch (error) {
    console.error("Load appointments error:", error);
    appointmentTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-cart">Failed to load appointments. Please try again.</td>
      </tr>
    `;
    startCounterAnimation(0);
  }
}

function renderAppointments(appointments, isAdminView = false) {
  appointmentTableBody.innerHTML = "";

  if (!appointments || appointments.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `
      <td colspan="6" class="empty-cart">
        ${isAdminView ? "No pending appointments" : "No appointments found"}
      </td>
    `;
    appointmentTableBody.appendChild(emptyRow);
    return;
  }

  const filteredAppointments = isAdminView
    ? appointments.filter((a) => a.status === "pending")
    : appointments.filter((a) => a.status !== "cancelled");

  filteredAppointments.forEach((appointment) => {
    const row = document.createElement("tr");

    row.innerHTML = `
  <td data-label="Pet Name">${(appointment.pet_name || "N/A").replace(
    /\b\w/g,
    (char) => char.toUpperCase()
  )}</td>
  <td data-label="Service">${(appointment.service_type || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()}</td>
  <td data-label="Date">${formatDate(appointment.appointment_date)}</td>
  <td data-label="Time">${formatTime(appointment.appointment_time)}</td>
  <td data-label="Status">
    <span class="appointment-status status-${(
      appointment.status || ""
    ).toLowerCase()}">
      ${
        (appointment.status || "").charAt(0).toUpperCase() +
        (appointment.status || "").slice(1)
      }
    </span>
  </td>
  <td data-label="Action" class="action-buttons">
    ${
      isAdminView
        ? `
        <button class="btn-action btn-approve" data-id="${appointment.id}">Approve</button>
        <button class="btn-action btn-reject" data-id="${appointment.id}">Reject</button>
      `
        : appointment.status === "pending" || appointment.status === "rejected"
        ? `<button class="btn-action btn-cancel" data-id="${appointment.id}">Cancel</button>`
        : ""
    }
  </td>
`;

    appointmentTableBody.appendChild(row);
  });

  if (isAdminView) {
    setupAdminButtons();
  } else {
    setupCancelButtons();
  }
}

async function cancelAppointment(appointmentId, button) {
  try {
    button.disabled = true;
    button.textContent = "Cancelling...";

    const response = await fetchWithCredentials(
      `${API_URL}/api/appointments/${appointmentId}/cancel`,
      {
        method: "POST",
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Cancel error:", error);
    throw error;
  }
}

function setupCancelButtons() {
  document.querySelectorAll(".btn-cancel").forEach((button) => {
    const row = button.closest("tr");
    const status = row
      .querySelector(".appointment-status")
      ?.textContent.trim()
      .toLowerCase();

    if (!["pending", "rejected"].includes(status)) {
      button.disabled = true;
      button.style.opacity = "0.6";
      button.style.cursor = "not-allowed";
      return;
    }

    button.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const appointmentId = button.getAttribute("data-id");

      try {
        const result = await cancelAppointment(appointmentId, button);

        if (result.success) {
          row.remove();
          showMessagePopup("Appointment cancelled successfully");
          updateAppointmentCounter();

          if (!document.querySelector(".appointment-table tbody tr")) {
            const emptyRow = document.createElement("tr");
            emptyRow.innerHTML =
              '<td colspan="6" class="empty-cart">No appointments found</td>';
            document
              .querySelector(".appointment-table tbody")
              .appendChild(emptyRow);
          }
        }
      } catch (error) {
        console.error("Failed to cancel:", error);
        showMessagePopup(error.message || "Failed to cancel appointment");
        button.disabled = false;
        button.textContent = "Cancel";
      }
    });
  });
}

function setupAdminButtons() {
  document.querySelectorAll(".btn-approve").forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.preventDefault();
      const appointmentId = this.getAttribute("data-id");
      await updateAppointmentStatus(appointmentId, "approved");
    });
  });

  document.querySelectorAll(".btn-reject").forEach((button) => {
    button.addEventListener("click", async function (e) {
      e.preventDefault();
      const appointmentId = this.getAttribute("data-id");
      await updateAppointmentStatus(appointmentId, "rejected");
    });
  });
}

async function updateAppointmentStatus(appointmentId, status) {
  try {
    const response = await fetchWithCredentials(
      `${API_URL}/api/appointments/${appointmentId}/status`,
      {
        method: "POST",
        body: JSON.stringify({ status }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to update appointment");
    }

    showMessagePopup(`Appointment ${status} successfully`);
    loadAppointments(true);
    updateAppointmentCounter();
  } catch (error) {
    console.error("Update appointment error:", error);
    showMessagePopup(error.message);
  }
}

// =========================
// Form Handling
// =========================
function toggleForm(e) {
  e.preventDefault();

  if (formContainer.classList.contains("active")) {
    formContainer.style.opacity = "0";
    setTimeout(() => {
      formContainer.classList.remove("active");
      window.scrollTo({ top: savedScrollPosition, behavior: "instant" });
    }, 0);
  } else {
    savedScrollPosition = window.scrollY;
    formContainer.classList.add("active");
    setTimeout(() => {
      formContainer.style.opacity = "1";
      formContainer.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 10);
  }
}

petCareForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  if (!petCareForm.checkValidity()) {
    const invalidFields = petCareForm.querySelectorAll(":invalid");
    if (invalidFields.length > 0) {
      invalidFields[0].scrollIntoView({ behavior: "smooth", block: "center" });
      invalidFields[0].focus();
    }
    return;
  }

  try {
    const formData = {
      ownerName: document.getElementById("ownerName").value,
      ownerEmail: document.getElementById("ownerEmail").value,
      ownerPhone: document.getElementById("ownerPhone").value,
      ownerAddress: document.getElementById("ownerAddress").value,
      petName: document.getElementById("petName").value,
      petType: document.getElementById("petType").value,
      petBreed: document.getElementById("petBreed").value,
      petAge: document.getElementById("petAge").value,
      appointmentDate: document.getElementById("appointmentDate").value,
      appointmentTime: document.getElementById("appointmentTime").value,
      serviceType: document.getElementById("serviceType").value,
      notes: document.getElementById("notes").value,
    };

    const response = await fetchWithCredentials(`${API_URL}/api/appointments`, {
      method: "POST",
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to book appointment");
    }

    formContainer.style.opacity = "0";
    setTimeout(() => {
      formContainer.classList.remove("active");
      successMessage.style.display = "block";
      setTimeout(() => {
        successMessage.classList.add("active");
        successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 10);
      petCareForm.reset();
    }, 500);

    setTimeout(() => {
      successMessage.classList.remove("active");
      setTimeout(() => {
        successMessage.style.display = "none";
      }, 500);
    }, 5000);

    updateAppointmentCounter();
  } catch (error) {
    console.error("Appointment submission error:", error);
    showMessagePopup(error.message);
  }
});

// =========================
// Event Listeners
// =========================
bookButton.addEventListener("click", toggleForm);
bookMeButton.addEventListener("click", toggleForm);

appointmentCart.addEventListener("click", async (e) => {
  e.preventDefault();
  appointmentOverlay.style.display = "flex";
  document.body.style.overflow = "hidden";
  await loadAppointments();
});

closePanel.addEventListener("click", (e) => {
  e.preventDefault();
  appointmentOverlay.style.display = "none";
  document.body.style.overflow = "auto";
});

appointmentOverlay.addEventListener("click", (e) => {
  if (e.target === appointmentOverlay) {
    appointmentOverlay.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// =========================
// Initialization
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  appointmentCounter = 0;
  appointmentCount.textContent = "0";

  const dateInput = document.getElementById("appointmentDate");
  if (dateInput) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    dateInput.setAttribute("min", `${yyyy}-${mm}-${dd}`);
  }

  if (appointmentRefreshInterval) {
    clearInterval(appointmentRefreshInterval);
  }

  const isAuthenticated = await checkAuthStatus();
  if (isAuthenticated) {
    appointmentRefreshInterval = setInterval(() => {
      updateAppointmentCounter();
    }, 30000);
  }

  updateAppointmentCounter();
});

window.addEventListener("beforeunload", () => {
  if (appointmentRefreshInterval) {
    clearInterval(appointmentRefreshInterval);
  }
  if (counterInterval) {
    clearInterval(counterInterval);
  }
});

// =========================
// Login/Logout Handling
// =========================
async function handleLogin(email, password) {
  try {
    const response = await fetchWithCredentials(`${API_URL}/api/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Login failed. Please check your credentials."
      );
    }

    currentUser = data.user;
    updateUIForUserRole();
    updateAppointmentCounter();
    showMessagePopup("Login successful");
    return true;
  } catch (error) {
    console.error("Login error:", error);
    showMessagePopup(error.message);
    return false;
  }
}

async function handleLogout() {
  try {
    if (appointmentRefreshInterval) {
      clearInterval(appointmentRefreshInterval);
      appointmentRefreshInterval = null;
    }
    if (counterInterval) {
      clearInterval(counterInterval);
      counterInterval = null;
    }

    const response = await fetchWithCredentials(`${API_URL}/api/logout`, {
      method: "POST",
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Logout failed");
    }

    currentUser = null;
    updateUIForUserRole();
    startCounterAnimation(0);
    showMessagePopup("Logged out successfully");
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    showMessagePopup(error.message);
    return false;
  }
}

// =========================
// Navbar Scroll Behavior
// =========================
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// =========================
// Mobile Menu Toggle
// =========================
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// =========================
// Smooth Scrolling for Nav Links
// =========================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    navLinks.classList.remove("active");

    const targetId = this.getAttribute("href");
    if (targetId === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const offset = navbar.offsetHeight;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  });
});

// =========================
// Auth Modal
// =========================
const userIcon = document.querySelector(".user-icon");
const modal = document.getElementById("authModal");
const closeModal = document.querySelector(".close-modal");

function openModal() {
  if (!userIcon.classList.contains("authenticated")) {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  }
}

function closeModalFunc() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

function setupAuthTabs() {
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".auth-tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".auth-form")
        .forEach((f) => f.classList.remove("active"));

      tab.classList.add("active");
      document
        .getElementById(tab.dataset.form + "Form")
        .classList.add("active");
    });
  });
}

function setupFormSwitchers() {
  document.querySelectorAll(".switch-form").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const formType = link.dataset.form;
      document.querySelector(`.auth-tab[data-form="${formType}"]`).click();
    });
  });
}

async function registerUser(email, password) {
  try {
    const response = await fetchWithCredentials(`${API_URL}/api/register`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      showMessagePopup("Registration successful!");
      document.querySelector(`.auth-tab[data-form="login"]`).click();
      document.getElementById("reg-email").value = "";
      document.getElementById("reg-password").value = "";
      document.getElementById("reg-confirm").value = "";
    } else {
      showMessagePopup(data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showMessagePopup("Registration failed");
  }
}

async function loginUser(email, password) {
  try {
    const success = await handleLogin(email, password);
    if (success) {
      setTimeout(() => {
        closeModalFunc();
        updateAuthUI();
      }, 1500);
    }
  } catch (error) {
    console.error("Login error:", error);
    showMessagePopup("Login failed");
  }
}

async function logoutUser() {
  try {
    await handleLogout();
    updateAuthUI();
  } catch (error) {
    console.error("Logout error:", error);
  }
}

async function checkAuth() {
  try {
    const response = await fetchWithCredentials(`${API_URL}/api/check-auth`);
    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
}

function showLogoutPopup() {
  closeModalFunc();
  document.getElementById("logoutPopup").style.display = "flex";
}

function hideLogoutPopup() {
  document.getElementById("logoutPopup").style.display = "none";
}

function setupRegisterForm() {
  const registerBtn = document
    .getElementById("registerForm")
    .querySelector("button");
  registerBtn.addEventListener("click", () => {
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;
    const confirm = document.getElementById("reg-confirm").value;

    if (!email || !password || !confirm) {
      showMessagePopup("All fields are required");
      return;
    }

    if (password !== confirm) {
      showMessagePopup("Passwords do not match");
      return;
    }

    registerUser(email, password);
  });
}

function setupLoginForm() {
  const loginBtn = document.getElementById("loginForm").querySelector("button");
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
      showMessagePopup("All fields are required");
      return;
    }

    loginUser(email, password);
  });
}

async function updateAuthUI() {
  const isAuthenticated = await checkAuth();

  if (isAuthenticated) {
    userIcon.onclick = showLogoutPopup;
    userIcon.classList.add("authenticated");
  } else {
    userIcon.onclick = openModal;
    userIcon.classList.remove("authenticated");
  }
}

function setupEventListeners() {
  userIcon.addEventListener("click", function () {
    openModal();
  });

  closeModal.addEventListener("click", closeModalFunc);

  window.addEventListener("click", (e) => {
    if (e.target === modal) closeModalFunc();
    if (e.target === document.getElementById("logoutPopup")) hideLogoutPopup();
  });

  document
    .getElementById("cancelLogout")
    .addEventListener("click", hideLogoutPopup);
  document.getElementById("confirmLogout").addEventListener("click", () => {
    hideLogoutPopup();
    logoutUser();
  });

  setupAuthTabs();
  setupFormSwitchers();
  setupRegisterForm();
  setupLoginForm();
}

function init() {
  setupEventListeners();
  updateAuthUI();
}

document.addEventListener("DOMContentLoaded", init);

// =========================
// Animations
// =========================
const animateOnScroll = () => {
  document.querySelectorAll(".animate__animated").forEach((element) => {
    const elementPosition = element.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (elementPosition < windowHeight - 100) {
      element.style.opacity = "1";
      element.style.animationDelay = "0s";
    }
  });
};

window.addEventListener("load", () => {
  animateOnScroll();
  window.addEventListener("scroll", animateOnScroll);
});

const equalizeCardHeights = () => {
  if (window.innerWidth > 768) {
    const cards = document.querySelectorAll(".service-card");
    let maxHeight = 0;

    cards.forEach((card) => (card.style.height = "auto"));
    cards.forEach((card) => {
      if (card.offsetHeight > maxHeight) {
        maxHeight = card.offsetHeight;
      }
    });
    cards.forEach((card) => (card.style.height = maxHeight + "px"));
  }
};

window.addEventListener("load", equalizeCardHeights);
window.addEventListener("resize", equalizeCardHeights);

document
  .getElementById("contactForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = e.target;
    const popup = document.getElementById("contactPopup");
    const messageEl = document.getElementById("contactPopupMessage");

    try {
      const response = await fetchWithCredentials(`${API_URL}/api/contact`, {
        method: "POST",
        body: JSON.stringify({
          name: form.name.value,
          email: form.email.value,
          subject: form.subject.value,
          message: form.message.value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed");
      }

      messageEl.textContent = data.message;
      popup.style.display = "flex";

      setTimeout(() => {
        popup.style.display = "none";
        if (data.success) form.reset();
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      messageEl.textContent = error.message || "Error while submitting form";
      popup.style.display = "flex";
      setTimeout(() => (popup.style.display = "none"), 2000);
    }
  });
