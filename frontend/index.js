// Theme management
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
updateThemeIcon();

function updateThemeIcon() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  themeIcon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon();
}

themeToggle.addEventListener('click', toggleTheme);

// Hamburger menu functionality
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navMobile = document.getElementById('navMobile');
const hamburgerLines = document.querySelectorAll('.hamburger-line');

function toggleMobileMenu() {
  const isOpen = navMobile.classList.contains('active');
  
  if (isOpen) {
    // Close menu
    navMobile.classList.remove('active');
    hamburgerLines.forEach((line, index) => {
      line.style.transform = 'none';
      line.style.opacity = '1';
    });
  } else {
    // Open menu
    navMobile.classList.add('active');
    hamburgerLines.forEach((line, index) => {
      if (index === 0) {
        line.style.transform = 'rotate(45deg) translate(5px, 5px)';
      } else if (index === 1) {
        line.style.opacity = '0';
      } else if (index === 2) {
        line.style.transform = 'rotate(-45deg) translate(7px, -6px)';
      }
    });
  }
}

hamburgerMenu.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
  const isClickInsideHeader = event.target.closest('.header');
  const isClickOnHamburger = event.target.closest('.hamburger-menu');
  
  if (!isClickInsideHeader && navMobile.classList.contains('active')) {
    toggleMobileMenu();
  }
});

// Navigation functionality
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// Smooth scrolling for navigation links
navLinks.forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    
    if (targetSection) {
      targetSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Close mobile menu if open
      if (navMobile.classList.contains('active')) {
        toggleMobileMenu();
      }
    }
  });
});

// Update active navigation link based on scroll position
function updateActiveNavLink() {
  const scrollPosition = window.scrollY + 100; // Offset for header
  
  sections.forEach((section, index) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    
    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      // Remove active class from all nav links
      navLinks.forEach(link => link.classList.remove('active'));
      
      // Add active class to corresponding nav links (both desktop and mobile)
      const activeLinks = document.querySelectorAll(`[href="#${sectionId}"]`);
      activeLinks.forEach(link => link.classList.add('active'));
    }
  });
}

// Add scroll event listener
window.addEventListener('scroll', updateActiveNavLink);

// Set initial active state
window.addEventListener('load', updateActiveNavLink);

// Form elements
const addUserForm = document.getElementById('addUserForm');
const deleteForm = document.getElementById('deleteForm');
const updateForm = document.getElementById('updateForm');
const refreshBtn = document.getElementById('refreshBtn');

// Regular expressions for validation
const nameRegex = /^[A-Z][a-z]{1,}$/;
const ageRegex = /^(1[01][0-9]|[1-9]?[0-9]|120)$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const educationRegex = /^[A-Za-z\s]{0,100}$/;

const validateInput = (value, pattern) => {
  return pattern.test(value);
};

// Add User Form Handler
addUserForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const firstName = document.getElementById("first-name").value.trim();
  const lastName = document.getElementById("last-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const age = document.getElementById("age").value.trim();
  const education = document.getElementById("education").value.trim();

  let isValid = true;
  let errors = [];

  if (!nameRegex.test(firstName)) {
    isValid = false;
    errors.push("First name must start with a capital letter and contain only letters.");
  }

  if (!nameRegex.test(lastName)) {
    isValid = false;
    errors.push("Last name must start with a capital letter and contain only letters.");
  }

  if (!emailRegex.test(email)) {
    isValid = false;
    errors.push("Email is not valid.");
  }

  if (!ageRegex.test(age)) {
    isValid = false;
    errors.push("Age must be a number between 0 and 120.");
  }

  if (education && !educationRegex.test(education)) {
    isValid = false;
    errors.push("Education must only contain letters and spaces (max 100 characters).");
  }

  if (!isValid) {
    showNotification("Form validation failed:\n\n" + errors.join("\n"), "error");
  } else {
    const submitBtn = addUserForm.querySelector('.btn-primary');
    const originalText = submitBtn.querySelector('.btn-text').textContent;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = 'Adding...';
    
    try {
      const response = await fetch("https://user-ms-xaam.vercel.app/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userFirstName: firstName,
          userLastName: lastName,
          userEmail: email,
          userAge: age,
          userEducation: education || "Not Available",
        }),
      });
      
      const data = await response.json();
      
      if (data.status === "success") {
        showNotification(`User added successfully! Welcome ${firstName}`, "success");
        addUserForm.reset();
        await loadSubmissions();
        
        // Scroll to users table after successful addition
        setTimeout(() => {
          const usersSection = document.getElementById('users-table');
          if (usersSection) {
            usersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 1000);
      } else {
        showNotification("Error: " + data.errors.join("\n"), "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Network error. Please try again.", "error");
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.querySelector('.btn-text').textContent = originalText;
    }
  }
});

// Load Submissions
const loadSubmissions = async () => {
  try {
    const response = await fetch("https://user-ms-xaam.vercel.app/api/submissions");
    const data = await response.json();
    
    if (data.status === "success") {
      const tableBody = document.querySelector("#tbody");
      tableBody.innerHTML = ""; // Clear existing rows
      
      if (data.results.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
              No users found. Add your first user above!
            </td>
          </tr>
        `;
        return;
      }
      
      data.results.forEach((submission) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${submission.id}</td>
          <td>${submission.firstName}</td>
          <td>${submission.lastName}</td>
          <td>${submission.email}</td>
          <td>${submission.age}</td>
          <td>${submission.education}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      showNotification("Error fetching users: " + data.message, "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Network error. Please try again.", "error");
  }
};

// Refresh button handler
refreshBtn.addEventListener('click', loadSubmissions);

// Delete User Form Handler
deleteForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  
  const userId = document.getElementById("delete-id").value.trim();
  if (!userId) {
    showNotification("Please enter a valid user ID to delete.", "error");
    return;
  }

  const deleteBtn = deleteForm.querySelector('.btn-danger');
  const originalText = deleteBtn.querySelector('.btn-text').textContent;
  
  // Show loading state
  deleteBtn.disabled = true;
  deleteBtn.querySelector('.btn-text').textContent = 'Deleting...';
  
  try {
    const response = await fetch(`https://user-ms-xaam.vercel.app/api/submissions/${userId}`, {
      method: "DELETE",
    });
    
    const data = await response.json();
    
    if (data.status === "success") {
      showNotification(data.message, "success");
      deleteForm.reset();
      await loadSubmissions();
      
      // Scroll to users table after successful deletion
      setTimeout(() => {
        const usersSection = document.getElementById('users-table');
        if (usersSection) {
          usersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1000);
    } else {
      showNotification("Error deleting user: " + data.errors.join("\n"), "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Network error. Please try again.", "error");
  } finally {
    // Reset button state
    deleteBtn.disabled = false;
    deleteBtn.querySelector('.btn-text').textContent = originalText;
  }
});

// Update User Form Handler
updateForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  
  const updateId = document.getElementById("update-id").value.trim();
  const updateFirstName = document.getElementById("update-first-name").value.trim();
  const updateLastName = document.getElementById("update-last-name").value.trim();
  const updateEmail = document.getElementById("update-email").value.trim();
  const updateAge = document.getElementById("update-age").value.trim();
  const updateEducation = document.getElementById("update-education").value.trim();
  
  if (!updateId) {
    showNotification("Please enter a valid user ID to update.", "error");
    return;
  }
  
  if (!updateFirstName && !updateLastName && !updateEmail && !updateAge && !updateEducation) {
    showNotification("Please provide at least one field to update.", "error");
    return;
  }
  
  const updateBtn = updateForm.querySelector('.btn-warning');
  const originalText = updateBtn.querySelector('.btn-text').textContent;
  
  // Show loading state
  updateBtn.disabled = true;
  updateBtn.querySelector('.btn-text').textContent = 'Updating...';
  
  try {
    const response = await fetch(`https://user-ms-xaam.vercel.app/api/submissions/${updateId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        updateFirstName,
        updateLastName,
        updateEmail,
        updateAge,
        updateEducation
      }),
    });
    
    const data = await response.json();
    
    if (data.status === "success") {
      showNotification(data.message, "success");
      updateForm.reset();
      await loadSubmissions();
      
      // Scroll to users table after successful update
      setTimeout(() => {
        const usersSection = document.getElementById('users-table');
        if (usersSection) {
          usersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 1000);
    } else {
      showNotification("Error updating user: " + data.errors.join("\n"), "error");
    }
  } catch (error) {
    console.error("Error:", error);
    showNotification("Network error. Please try again.", "error");
  } finally {
    // Reset button state
    updateBtn.disabled = false;
    updateBtn.querySelector('.btn-text').textContent = originalText;
  }
});

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'var(--accent-success)' : type === 'error' ? 'var(--accent-danger)' : 'var(--accent-primary)'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: var(--shadow-lg);
    z-index: 1000;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  notification.querySelector('.notification-content').style.cssText = `
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  `;
  
  notification.querySelector('.notification-close').style.cssText = `
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Load submissions when page loads
window.addEventListener("DOMContentLoaded", () => {
  loadSubmissions();
});  
