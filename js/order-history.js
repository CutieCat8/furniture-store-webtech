const API_BASE = "http://localhost:3000/api";

const tableEl = document.querySelector("[data-orders-table]");
const emptyEl = document.querySelector("[data-orders-empty]");
const searchInput = document.querySelector("[data-orders-search]");
const searchBtn = document.querySelector("[data-orders-search-btn]");
const accountNameEl = document.querySelector("[data-account-name]");
const accountEmailEl = document.querySelector("[data-account-email]");
const selectAllEl = document.querySelector("[data-orders-select-all]");
const deleteSelectedBtn = document.querySelector("[data-orders-delete-selected]");
const deleteAllBtn = document.querySelector("[data-orders-delete-all]");
const statusEl = document.querySelector("[data-orders-status]");

const modalEl = document.querySelector("[data-receipt-modal]");
const modalCloseEl = document.querySelector("[data-receipt-close]");
const receiptOrderId = document.querySelector("[data-receipt-order-id]");
const receiptDate = document.querySelector("[data-receipt-date]");
const receiptEmail = document.querySelector("[data-receipt-email]");
const receiptItems = document.querySelector("[data-receipt-items]");
const receiptTotal = document.querySelector("[data-receipt-total]");
const receiptCard = document.querySelector("[data-receipt-card]");

let productMap = {};
let selectedOrderIds = new Set();
let currentEmail = "";

function formatPrice(value) {
  const numberValue = Number(value) || 0;
  return `$${numberValue.toFixed(2)}`;
}

function setAccountInfo(email) {
  if (!email) {
    accountNameEl.textContent = "Customer";
    accountEmailEl.textContent = "Guest";
    return;
  }
  const name = email.split("@")[0] || "Customer";
  accountNameEl.textContent = name.charAt(0).toUpperCase() + name.slice(1);
  accountEmailEl.textContent = email;
}

function clearOrders() {
  const rows = tableEl.querySelectorAll(".order-row.data");
  rows.forEach((row) => row.remove());
  selectedOrderIds = new Set();
  if (selectAllEl) {
    selectAllEl.checked = false;
  }
  updateDeleteState();
}

function updateDeleteState() {
  const hasSelection = selectedOrderIds.size > 0;
  if (deleteSelectedBtn) {
    deleteSelectedBtn.disabled = !hasSelection;
  }
  if (statusEl) {
    statusEl.textContent = hasSelection
      ? `Selected ${selectedOrderIds.size} order(s).`
      : "Select orders to delete.";
  }
  if (selectAllEl) {
    const totalCheckboxes = tableEl.querySelectorAll("[data-order-select]").length;
    selectAllEl.checked = totalCheckboxes > 0 && selectedOrderIds.size === totalCheckboxes;
  }
}

function renderOrders(orders) {
  clearOrders();

  if (!orders.length) {
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";

  orders.forEach((order) => {
    const itemCount = order.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const row = document.createElement("div");
    row.className = "order-row data";

    row.innerHTML = `
      <span class="order-cell-select">
        <input type="checkbox" data-order-select data-order-id="${order.orderId}" aria-label="Select order ${order.orderId}">
      </span>
      <span>${order.orderId}</span>
      <span>${itemCount} items</span>
      <span><span class="status-pill">Paid</span></span>
      <span>${formatPrice(order.total)}</span>
      <span><button class="receipt-button" type="button">View Receipt</button></span>
    `;

    row.querySelector(".receipt-button").addEventListener("click", () => {
      openReceipt(order);
    });

    tableEl.appendChild(row);
  });

  updateDeleteState();
}

function openReceipt(order) {
  receiptOrderId.textContent = order.orderId || "--";
  receiptDate.textContent = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "--";
  receiptEmail.textContent = order.email || "--";
  receiptTotal.textContent = formatPrice(order.total);
  receiptCard.textContent = "**** **** **** 0000";

  receiptItems.innerHTML = "";
  order.items.forEach((item) => {
    const name = productMap[item.productId] || `Product ${item.productId}`;
    const line = document.createElement("div");
    line.className = "receipt-row";
    line.innerHTML = `
      <span>${name} x${item.quantity}</span>
      <span>${formatPrice(item.totalPrice)}</span>
    `;
    receiptItems.appendChild(line);
  });

  modalEl.classList.add("is-open");
}

function closeReceipt() {
  modalEl.classList.remove("is-open");
}

async function loadProducts() {
  try {
    const response = await fetch("data/json/products.json");
    const data = await response.json();
    productMap = (data || []).reduce((acc, item) => {
      acc[item.id] = item.name;
      return acc;
    }, {});
  } catch (error) {
    productMap = {};
  }
}

async function loadOrders(email) {
  const query = email ? `?email=${encodeURIComponent(email)}` : "";
  const response = await fetch(`${API_BASE}/orders${query}`);
  const payload = await response.json();
  return payload.data || [];
}

async function deleteSelectedOrders(email) {
  const orderIds = Array.from(selectedOrderIds);
  if (!orderIds.length) {
    return false;
  }

  const response = await fetch(`${API_BASE}/orders/selected`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email || null,
      orderIds,
    }),
  });

  if (!response.ok) {
    return false;
  }

  return true;
}

async function deleteAllOrders(email) {
  if (!email) {
    return false;
  }

  const response = await fetch(`${API_BASE}/orders?email=${encodeURIComponent(email)}`, {
    method: "DELETE",
  });

  return response.ok;
}

async function refreshOrders(email) {
  try {
    currentEmail = email || "";
    const orders = await loadOrders(email);
    renderOrders(orders);
  } catch (error) {
    renderOrders([]);
  }
}

tableEl.addEventListener("change", (event) => {
  const target = event.target;
  if (!target || target.getAttribute("data-order-select") === null) {
    return;
  }
  const orderId = target.getAttribute("data-order-id");
  if (!orderId) {
    return;
  }
  if (target.checked) {
    selectedOrderIds.add(orderId);
  } else {
    selectedOrderIds.delete(orderId);
  }
  updateDeleteState();
});

if (selectAllEl) {
  selectAllEl.addEventListener("change", (event) => {
    const checked = event.target.checked;
    const checkboxes = tableEl.querySelectorAll("[data-order-select]");
    selectedOrderIds = new Set();
    checkboxes.forEach((checkbox) => {
      checkbox.checked = checked;
      if (checked) {
        const orderId = checkbox.getAttribute("data-order-id");
        if (orderId) {
          selectedOrderIds.add(orderId);
        }
      }
    });
    updateDeleteState();
  });
}

if (deleteSelectedBtn) {
  deleteSelectedBtn.addEventListener("click", async () => {
    if (!selectedOrderIds.size) {
      return;
    }
    const confirmed = window.confirm("Delete selected orders?");
    if (!confirmed) {
      return;
    }
    const ok = await deleteSelectedOrders(currentEmail);
    if (ok) {
      await refreshOrders(currentEmail);
    } else if (statusEl) {
      statusEl.textContent = "Failed to delete selected orders.";
    }
  });
}

if (deleteAllBtn) {
  deleteAllBtn.addEventListener("click", async () => {
    if (!currentEmail) {
      if (statusEl) {
        statusEl.textContent = "Enter an email before deleting.";
      }
      return;
    }
    const confirmed = window.confirm("Delete all orders for this email?");
    if (!confirmed) {
      return;
    }
    const ok = await deleteAllOrders(currentEmail);
    if (ok) {
      await refreshOrders(currentEmail);
    } else if (statusEl) {
      statusEl.textContent = "Failed to delete orders.";
    }
  });
}

modalCloseEl.addEventListener("click", closeReceipt);
modalEl.addEventListener("click", (event) => {
  if (event.target === modalEl) {
    closeReceipt();
  }
});

searchBtn.addEventListener("click", () => {
  const email = searchInput.value.trim();
  setAccountInfo(email);
  refreshOrders(email);
});

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const email = searchInput.value.trim();
    setAccountInfo(email);
    refreshOrders(email);
  }
});

(async function init() {
  const storedEmail = localStorage.getItem("authEmail") || "";
  if (storedEmail) {
    searchInput.value = storedEmail;
  }
  setAccountInfo(storedEmail);
  await loadProducts();
  await refreshOrders(storedEmail);
})();
