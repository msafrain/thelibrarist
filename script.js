const shelfEl = document.getElementById("bookshelf");
const summaryPopup = document.getElementById("summary-popup");
const summaryTitle = document.getElementById("summary-title");
const summaryPrice = document.getElementById("summary-price");
const summaryText = document.getElementById("summary-text");
const summaryCloseBtn = document.getElementById("summary-close");

const bookModal = document.getElementById("book-modal");
const imagesContainer = document.getElementById("book-images");
const detailTitle = document.getElementById("detail-title");
const detailPrice = document.getElementById("detail-price");
const detailCondition = document.getElementById("detail-condition");
const detailSummary = document.getElementById("detail-summary");
const buyLink = document.getElementById("buy-link");
const soldCountSpan = document.getElementById("sold-count");
const modalCloseBtn = document.getElementById("modal-close");

let currentBooks = [];
let currentSummaryBookId = null;

/* Load book data */
fetch("books.json")
  .then((res) => res.json())
  .then((data) => {
    currentBooks = data.books || [];
    renderShelf(currentBooks);
    updateSoldCount(currentBooks);
  })
  .catch((err) => {
    console.error("Error loading books.json", err);
  });

/* Render bookshelf: 4 books per row, skip books with status === "sold" */
function renderShelf(books) {
  shelfEl.innerHTML = "";
  const visibleBooks = books.filter((b) => b.status !== "sold");

  const booksPerRow = 4;
  let rowEl = null;

  visibleBooks.forEach((book, index) => {
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

    /* Hover → show summary popup */
    bookEl.addEventListener("mouseenter", () => showSummary(book));
    bookEl.addEventListener("mouseleave", () => hideSummaryDelayed());
    /* Click → open book detail */
    bookEl.addEventListener("click", () => openBookDetail(book));
  });
}

/* Update Books Sold counter */
function updateSoldCount(books) {
  const soldCount = books.filter((b) => b.status === "sold").length;
  soldCountSpan.textContent = soldCount;
}

/* Show center summary popup */
let hideSummaryTimeout = null;

function showSummary(book) {
  if (hideSummaryTimeout) {
    clearTimeout(hideSummaryTimeout);
    hideSummaryTimeout = null;
  }

  currentSummaryBookId = book.id;

  summaryTitle.textContent = book.title;
  summaryPrice.textContent =
    (book.currency || "SGD") + " " + (book.price != null ? book.price : "");
  summaryText.textContent = book.summary || "";

  summaryPopup.classList.remove("hidden");
}

function closeSummary() {
  currentSummaryBookId = null;
  summaryPopup.classList.add("hidden");
}

function hideSummaryDelayed() {
  hideSummaryTimeout = setTimeout(() => {
    closeSummary();
  }, 400);
}

summaryPopup.addEventListener("mouseenter", () => {
  if (hideSummaryTimeout) {
    clearTimeout(hideSummaryTimeout);
    hideSummaryTimeout = null;
  }
});

summaryPopup.addEventListener("mouseleave", () => {
  hideSummaryDelayed();
});

summaryCloseBtn.addEventListener("click", () => {
  closeSummary();
});

/* Open book detail modal */
function openBookDetail(book) {
  closeSummary();

  // Title, price, condition, summary
  detailTitle.textContent = book.title;
  detailPrice.textContent =
    (book.currency || "SGD") + " " + (book.price != null ? book.price : "");
  detailCondition.textContent = book.condition || "";
  detailSummary.textContent = book.summary || "";

  // Buy link to Google Form
  if (book.googleFormUrl) {
    buyLink.href = book.googleFormUrl;
    buyLink.style.display = "inline-block";
  } else {
    buyLink.href = "#";
    buyLink.style.display = "none";
  }

  // Images from any URL (Google Drive, etc.)
  imagesContainer.innerHTML = "";
  (book.images || []).forEach((src) => {
    const img = document.createElement("img");
    img.className = "book-photo";
    img.src = src;
    img.alt = book.title;
    imagesContainer.appendChild(img);
  });

  bookModal.classList.remove("hidden");
}

/* Close modal */
function closeModal() {
  bookModal.classList.add("hidden");
}

/* Click X button */
modalCloseBtn.addEventListener("click", () => {
  closeModal();
});

/* Click overlay background to close */
bookModal.addEventListener("click", (e) => {
  if (e.target === bookModal) {
    closeModal();
  }
});

/* ESC key closes everything */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeSummary();
  }
});
