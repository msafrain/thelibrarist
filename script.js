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
let currentSummaryBook = null;

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
  const minRows = 4; // visually: 4 shelves minimum

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

    // hover summary
    bookEl.addEventListener("mouseenter", () => showSummary(book));
    bookEl.addEventListener("mouseleave", () => hideSummaryDelayed());

    // click → protrude + open book
    bookEl.addEventListener("click", () => {
      bookEl.classList.add("pickup");
      setTimeout(() => {
        bookEl.classList.remove("pickup");
        openBookDetail(book);
      }, 230);
    });
  });

  // add empty shelves to extend the bookcase visually
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

summaryPopup.addEventListener("mouseleave", hideSummaryDelayed);

// close button
summaryCloseBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closeSummary();
});

// click on the yellow card → open the same book
summaryPopup.addEventListener("click", () => {
  if (currentSummaryBook) {
    openBookDetail(currentSummaryBook);
  }
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
  const images = book.images || [];
  if (images.length > 0) {
    images.forEach((src) => {
      const img = document.createElement("img");
      img.className = "book-photo";
      img.src = src;
      img.alt = book.title;
      imagesContainer.appendChild(img);
    });
  } else {
    const p = document.createElement("p");
    p.className = "no-photo";
    p.textContent = "No photos added for this book yet.";
    imagesContainer.appendChild(p);
  }

  bookModal.classList.remove("hidden");
}

/* ====== CLOSE MODAL ====== */

function closeModal() {
  bookModal.classList.add("hidden");
}

modalCloseBtn.addEventListener("click", closeModal);

bookModal.addEventListener("click", (e) => {
  if (e.target === bookModal) {
    closeModal();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal();
    closeSummary();
  }
});
