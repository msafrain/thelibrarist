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
let hideSummaryTimeout = null;
let currentSummaryBook = null; // track which book is in the popup

/* ====== LOAD DATA ====== */
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

/* ====== RENDER SHELF ====== */

function renderShelf(books) {
  shelfEl.innerHTML = "";
  const visibleBooks = books.filter((b) => b.status !== "sold");
  const booksPerRow = 4;
  const minRows = 4; // always show at least 4 shelves

  let rowEl = null;

  // place real books
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

    // Desktop hover
    bookEl.addEventListener("mouseenter", () => showSummary(book));
    bookEl.addEventListener("mouseleave", () => hideSummaryDelayed());

    // Touch devices – treat touch like hover
    bookEl.addEventListener("touchstart", () => showSummary(book), {
      passive: true,
    });
    bookEl.addEventListener("touchend", () => hideSummaryDelayed(), {
      passive: true,
    });

    // Click to "pick up" then open
    bookEl.addEventListener("click", () => {
      bookEl.classList.add("pickup");
      setTimeout(() => {
        bookEl.classList.remove("pickup");
        openBookDetail(book);
      }, 230);
    });
  });

  // add extra empty rows so the shelf visually stacks downward
  const currentRows = shelfEl.children.length;
  if (currentRows < minRows) {
    for (let i = currentRows; i < minRows; i++) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "shelf-row";
      shelfEl.appendChild(emptyRow);
    }
  }
}

/* ====== SOLD COUNTER ====== */

function updateSoldCount(books) {
  const soldCount = books.filter((b) => b.status === "sold").length;
  soldCountSpan.textContent = soldCount;
}

/* ====== SUMMARY POPUP ====== */

function showSummary(book) {
  if (hideSummaryTimeout) {
    clearTimeout(hideSummaryTimeout);
    hideSummaryTimeout = null;
  }

  currentSummaryBook = book;

  summaryTitle.textContent = book.title;
  summaryPrice.textContent =
    (book.currency || "SGD") + " " + (book.price != null ? book.price : "");
  summaryText.textContent = book.summary || "";

  summaryPopup.classList.remove("hidden");
}

function closeSummary() {
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

// Clicking the yellow card opens the book
summaryPopup.addEventListener("click", () => {
  if (currentSummaryBook) {
    openBookDetail(currentSummaryBook);
  }
});

// Close button only closes, doesn't trigger the open-book click
summaryCloseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closeSummary();
});

/* ====== OPEN BOOK MODAL ====== */

function openBookDetail(book) {
  closeSummary();

  detailTitle.textContent = book.title;
  detailPrice.textContent =
    (book.currency || "SGD") + " " + (book.price != null ? book.price : "");
  detailCondition.textContent = book.condition || "";
  detailSummary.textContent = book.summary || "";

  if (book.googleFormUrl) {
    buyLink.href = book.googleFormUrl;
    buyLink.style.display = "inline-block";
  } else {
    buyLink.href = "#";
    buyLink.style.display = "none";
  }

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

/* ====== CLOSE MODAL ====== */

function closeModal() {
  bookModal.classList.add("hidden");
}

modalCloseBtn.addEventListener("click", () => {
  closeModal();
});

// Click outside the open book closes it
bookModal.addEventListener("click", (e) => {
  if (e.target === bookModal) {
    closeModal();
  }
});

// ESC closes both modal and summary
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeSummary();
  }
});
