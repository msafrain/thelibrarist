const shelfEl = document.getElementById("bookshelf");
const summaryPopup = document.getElementById("summary-popup");
const summaryTitle = document.getElementById("summary-title");
const summaryPrice = document.getElementById("summary-price");
const summaryText = document.getElementById("summary-text");

const bookModal = document.getElementById("book-modal");
const imagesContainer = document.getElementById("book-images");
const detailTitle = document.getElementById("detail-title");
const detailPrice = document.getElementById("detail-price");
const detailCondition = document.getElementById("detail-condition");
const detailSummary = document.getElementById("detail-summary");
const buyLink = document.getElementById("buy-link");
const soldCountSpan = document.getElementById("sold-count");

let currentBooks = [];
let hoveredBook = null;

// close helpers
function closeSummary() {
  summaryPopup.classList.add("hidden");
  hoveredBook = null;
}

function closeModal() {
  bookModal.classList.add("hidden");
}

function bookModalIsOpen() {
  return !bookModal.classList.contains("hidden");
}

// Load books.json
fetch("books.json")
  .then((res) => res.json())
  .then((data) => {
    currentBooks = data.books || [];
    renderShelf(currentBooks);
    updateSoldCount(currentBooks);
  })
  .catch((err) => console.error("Error loading books.json", err));

// Render shelf
function renderShelf(books) {
  const booksPerRow = 4;
  const available = books.filter((b) => b.status === "available");

  let rowEl = null;

  available.forEach((book, index) => {
    if (index % booksPerRow === 0) {
      rowEl = document.createElement("div");
      rowEl.className = "shelf-row";
      shelfEl.appendChild(rowEl);
    }

    const bookEl = document.createElement("div");
    bookEl.className = "book";
    bookEl.dataset.bookId = book.id;

    const titleEl = document.createElement("div");
    titleEl.className = "book-title";
    titleEl.textContent = book.title;

    bookEl.appendChild(titleEl);
    rowEl.appendChild(bookEl);

    bookEl.addEventListener("mouseenter", () => {
      showSummaryPopup(book);
    });

    bookEl.addEventListener("mouseleave", () => {
      if (!bookModalIsOpen()) {
        closeSummary();
      }
    });

    bookEl.addEventListener("click", () => {
      openBookModal(book);
    });
  });
}

// Sold count
function updateSoldCount(books) {
  const soldCount = books.filter((b) => b.status === "sold").length;
  soldCountSpan.textContent = soldCount;
}

// Summary popup
function showSummaryPopup(book) {
  hoveredBook = book;

  summaryTitle.textContent = book.title;
  summaryPrice.textContent = book.price
    ? `${book.currency || "SGD"} $${book.price}`
    : "";
  summaryText.textContent = book.summary || "";

  summaryPopup.classList.remove("hidden");
}

// clicking summary (except close) opens modal
summaryPopup.addEventListener("click", (e) => {
  if (e.target.closest("[data-close-summary]")) return;
  if (hoveredBook) openBookModal(hoveredBook);
});

// Modal
function openBookModal(book) {
  detailTitle.textContent = book.title;
  detailPrice.textContent = book.price
    ? `${book.currency || "SGD"} $${book.price}`
    : "";
  detailCondition.textContent = book.condition || "";
  detailSummary.textContent = book.summary || "";

  imagesContainer.innerHTML = "";
  (book.images || []).forEach((src) => {
    const img = document.createElement("img");
    img.src = src;
    img.alt = book.title;
    imagesContainer.appendChild(img);
  });

  if (book.googleFormUrl) {
    buyLink.href = book.googleFormUrl;
  } else {
    buyLink.href = "https://forms.gle/tCc7eWueQTcFyh488";
  }

  bookModal.classList.remove("hidden");
}

// close buttons
document.querySelectorAll("[data-close-summary]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeSummary();
  });
});

document.querySelectorAll("[data-close-modal]").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeModal();
  });
});

// click overlay to close modal
bookModal.addEventListener("click", (e) => {
  if (e.target === bookModal) {
    closeModal();
  }
});

// Esc key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeSummary();
  }
});
