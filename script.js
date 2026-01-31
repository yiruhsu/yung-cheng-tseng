// 導覽列高亮狀態統一控管
function setActiveNav(pageId) {
  const navLinks = document.querySelectorAll(".nav-link");
  const logo = document.querySelector(".logo");
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });
  if (logo) {
    logo.classList.toggle("active", pageId === "home");
  }

  const pageNavMap = {
    home: 0,
    bio: 1,
    calligraphy: 2,
    sealcarving: 3,
    painting: 4,
    exhibition: 5,
  };

  if (pageNavMap[pageId] !== undefined) {
    const navIndex = pageNavMap[pageId];
    if (navLinks && navLinks[navIndex]) {
      navLinks[navIndex].classList.add("active");
    }
  }
}

// --- 導覽列自動高亮 (Scroll Spy) ---
function initNavScrollSpy() {
  const sections = document.querySelectorAll(".page"); // 每個頁面區塊都是 .page
  const navLinks = document.querySelectorAll(".navigation a");
  const logo = document.querySelector(".logo");
  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    threshold: 0, // 只要碰到中線就觸發
    rootMargin: "-50% 0px -50% 0px", // 關鍵修正：將偵測範圍縮小為螢幕正中間的一條線
  };

  const observerCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        if (!id) return;

        navLinks.forEach((link) => link.classList.remove("active"));

        const activeLink = document.querySelector(
          `.navigation a[onclick*="${id}"]`,
        );
        if (activeLink) {
          activeLink.classList.add("active");
        } else {
          setActiveNav(id);
        }

        if (logo) {
          logo.classList.toggle("active", id === "home");
        }
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  sections.forEach((section) => observer.observe(section));
}

// 頁面切換功能
function showPage(pageId) {
  destroyPaintingHorizontal();

  // 控制頁面背景色：bio、書法、篆刻、繪畫、展演頁面使用米白底
  const lightPages = [
    "bio",
    "calligraphy",
    "sealcarving",
    "painting",
    "exhibition",
  ];
  if (lightPages.includes(pageId)) {
    document.body.classList.add("page-light");
  } else {
    document.body.classList.remove("page-light");
  }

  // 移除滑鼠白色圓點停留在原地的狀態
  const cursor = document.getElementById("custom-cursor");
  if (cursor) {
    cursor.classList.remove("hovered");
    cursor.classList.remove("clicked");
    // 確保游標恢復正常大小和樣式
    cursor.style.width = "";
    cursor.style.height = "";
    cursor.style.backgroundColor = "";
    cursor.style.border = "";
    cursor.style.transform = "";
    
    // 強制觸發重繪，避免游標卡住
    void cursor.offsetHeight;
  }

  // 隱藏所有頁面
  const pages = document.querySelectorAll(".page");
  pages.forEach((page) => {
    page.classList.remove("active");
    // 強制隱藏
    page.style.display = "none";
    page.style.visibility = "hidden";
  });

  // 顯示選中的頁面
  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add("active");
    // 強制顯示
    targetPage.style.display = "block";
    targetPage.style.visibility = "visible";
    targetPage.style.opacity = "1";

    // 初始化該頁面的畫廊，確保圖片正確顯示
    setTimeout(() => {
      initGalleries();
      // 特別針對 painting 頁面，確保圖片正確顯示
      if (pageId === "painting") {
        const paintingGalleries = targetPage.querySelectorAll(".image-gallery");
        paintingGalleries.forEach((gallery) => {
          const container = gallery.querySelector(".gallery-container");
          if (container) {
            const images = container.querySelectorAll(".gallery-image");
            if (images.length > 0 && !images[0].classList.contains("active")) {
              images[0].classList.add("active");
            }
          }
        });
      }

      if (pageId === "calligraphy") {
        initAnimations();
        // 初始化手機版觸控滑動功能
        setTimeout(() => {
          initCalligraphyTouchSwipe();
        }, 200);
      }

      if (pageId === "painting") {
        initPaintingAnimation();
      }

      if (pageId === "sealcarving") {
        initSealCarvingDice();
      }
    }, 150);
  } else {
    console.error("找不到頁面:", pageId);
  }

  setActiveNav(pageId);

  document.dispatchEvent(
    new CustomEvent("exhibitionPageToggled", {
      detail: { active: pageId === "exhibition" },
    }),
  );
  if (window.handleExhibitionPageToggle) {
    window.handleExhibitionPageToggle(pageId === "exhibition");
  }

  // 滾動到頂部
  window.scrollTo(0, 0);
}

// 首頁全螢幕輪播 - 更新為6張照片
const heroImages = [
  "images/hero/hero-1.webp",
  "images/hero/hero-2.webp",
  "images/hero/hero-3.webp",
  "images/hero/hero-4.webp",
  "images/hero/hero-5.webp",
  "images/hero/hero-6.webp",
];

function initHeroSlideshow() {
  const container = document.querySelector(".hero-slideshow");
  if (!container || heroImages.length === 0) return;

  container.innerHTML = "";

  // Safari性能優化：預先載入所有圖片
  heroImages.forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  heroImages.forEach((src, index) => {
    const slide = document.createElement("div");
    slide.className = `hero-slide${index === 0 ? " active" : ""}`;
    slide.style.backgroundImage = `url('${src}')`;
    container.appendChild(slide);
  });

  let currentIndex = 0;
  const slides = container.querySelectorAll(".hero-slide");

  if (slides.length <= 1) return;

  setInterval(() => {
    slides[currentIndex].classList.remove("active");
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add("active");
  }, 5000); // 每 5 秒切換一次
}

// 語言切換功能
let currentLanguage = "en"; // 預設英文

function switchLanguage(lang) {
  currentLanguage = lang;

  // 更新 body 的 class 來控制導覽列語言顯示
  document.body.classList.remove("lang-zh", "lang-en");
  document.body.classList.add(`lang-${lang}`);

  // 更新語言按鈕狀態
  const langButtons = document.querySelectorAll(".lang-btn");
  langButtons.forEach((btn) => {
    btn.classList.remove("active");
    if (
      (lang === "zh" && btn.textContent === "CH") ||
      (lang === "en" && btn.textContent === "EN")
    ) {
      btn.classList.add("active");
    }
  });

  // 切換所有帶有語言屬性的元素
  const elements = document.querySelectorAll("[data-lang-zh], [data-lang-en]");
  elements.forEach((element) => {
    let text = "";
    if (lang === "zh" && element.hasAttribute("data-lang-zh")) {
      text = element.getAttribute("data-lang-zh");
    } else if (lang === "en" && element.hasAttribute("data-lang-en")) {
      text = element.getAttribute("data-lang-en");
    }

    if (text) {
      element.textContent = text;
    }
  });

  // 更新 HTML lang 屬性
  document.documentElement.lang = lang === "zh" ? "zh-TW" : "en";
}

// 初始化畫廊：確保第一張圖片有 active class
function initGalleries() {
  const galleries = document.querySelectorAll(".image-gallery");
  galleries.forEach((gallery) => {
    const container = gallery.querySelector(".gallery-container");
    if (!container) return;

    const images = container.querySelectorAll(".gallery-image");
    if (!images || images.length === 0) return;

    // 檢查是否已經有 active 的圖片
    let hasActive = false;
    images.forEach((img) => {
      if (img.classList.contains("active")) {
        hasActive = true;
      }
    });

    // 如果沒有 active 的圖片，將第一張設為 active
    if (!hasActive && images[0]) {
      images[0].classList.add("active");
    }
  });
}

// 隱藏只有一張圖片的箭頭
function hideSingleImageArrows() {
  const galleries = document.querySelectorAll(".image-gallery");
  galleries.forEach((gallery) => {
    const container = gallery.querySelector(".gallery-container");
    if (!container) return;
    const images = container.querySelectorAll(".gallery-image");
    const prevBtn = gallery.querySelector(".gallery-prev");
    const nextBtn = gallery.querySelector(".gallery-next");

    if (images.length <= 1) {
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
    } else {
      if (prevBtn) prevBtn.style.display = "flex";
      if (nextBtn) nextBtn.style.display = "flex";
    }
  });
}

let gsapRevealRegistered = false;
let calligraphyTriggers = [];

function initAnimations() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  if (!gsapRevealRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    gsapRevealRegistered = true;
  }

  calligraphyTriggers.forEach((trigger) => trigger.kill());
  calligraphyTriggers = [];

  const isDesktop = window.matchMedia("(min-width: 1025px)").matches;
  const galleries = document.querySelectorAll("#calligraphy .image-gallery");

  if (!isDesktop) {
    // 手機/平板：用淡入取代捲軸動畫（每次進入都重置）
    if (typeof IntersectionObserver === "undefined") {
      galleries.forEach((gallery) =>
        gallery.classList.add("calligraphy-visible"),
      );
      return;
    }

    const groups = Array.from(
      document.querySelectorAll("#calligraphy .artwork-group"),
    );
    const getDelayForGallery = (gallery) => {
      const group = gallery.closest(".artwork-group");
      if (!group) return 0;
      const index = groups.indexOf(group);
      return index === 2 ? 1.5 : 0;
    };

    galleries.forEach((gallery) => {
      gallery.classList.remove("calligraphy-visible");
      gallery.style.transitionDelay = "0s";
    });

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const delay = getDelayForGallery(entry.target);
          entry.target.style.transitionDelay = `${delay}s`;
          entry.target.classList.add("calligraphy-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.2, rootMargin: "120px 0px" },
    );

    galleries.forEach((gallery) => observer.observe(gallery));
    return;
  }

  // 桌面版：保留捲軸顯示動畫
  const targets = document.querySelectorAll("#calligraphy .gallery-image");
  targets.forEach((img) => {
    if (!img) return;

    const tween = gsap.fromTo(
      img,
      {
        y: -50,
        autoAlpha: 0,
        clipPath: "inset(0 0 100% 0)",
      },
      {
        y: 0,
        autoAlpha: 1,
        clipPath: "inset(0 0 0% 0)",
        duration: 3,
        ease: "power3.out",
        scrollTrigger: {
          trigger: img,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      },
    );

    if (tween.scrollTrigger) {
      calligraphyTriggers.push(tween.scrollTrigger);
    }
  });

  ScrollTrigger.refresh();
}

let paintingScrollTween;
let scrollRefreshRaf = null;

function scheduleScrollTriggerRefresh() {
  if (scrollRefreshRaf) {
    cancelAnimationFrame(scrollRefreshRaf);
  }
  scrollRefreshRaf = requestAnimationFrame(() => {
    scrollRefreshRaf = null;
    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
}

function initPaintingAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  if (!gsapRevealRegistered) {
    gsap.registerPlugin(ScrollTrigger);
    gsapRevealRegistered = true;
  }

  // 1. 清理舊動畫
  ScrollTrigger.getAll().forEach((t) => {
    if (t.trigger && t.trigger.classList.contains("painting-viewport")) {
      t.kill();
    }
  });

  const track = document.querySelector(".painting-track");
  const viewport = document.querySelector(".painting-viewport");

  if (!track || !viewport) return;

  // 2. 滾動計算函式
  function getScrollAmount() {
    const trackWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    // 關鍵修正：
    // 使用 window.innerWidth * 0.6 (60% 的視窗寬度) 作為緩衝。
    // 這樣無論螢幕多大，緩衝區永遠大於 gap (35vw)，確保最後一張圖絕對會滑出來。
    const buffer = viewportWidth * 0.6;
    return -(trackWidth - viewportWidth + buffer);
  }

  // 3. 建立動畫
  paintingScrollTween = gsap.to(track, {
    x: getScrollAmount,
    ease: "none",
    scrollTrigger: {
      trigger: viewport,
      pin: true,
      scrub: 0.25, // 進一步降低延遲，提升滑動即時感
      anticipatePin: 1,
      fastScrollEnd: true,
      // End 也同步增加緩衝，讓滾動軸長度足以容納多出來的距離
      end: () => `+=${Math.abs(getScrollAmount())}`,
      invalidateOnRefresh: true,
    },
  });
}

function destroyPaintingHorizontal() {
  if (paintingScrollTween) {
    if (paintingScrollTween.scrollTrigger) {
      paintingScrollTween.scrollTrigger.kill();
    }
    paintingScrollTween.kill();
    paintingScrollTween = null;
  }

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.getAll().forEach((trigger) => {
      if (
        trigger.trigger &&
        trigger.trigger.classList.contains("painting-viewport")
      ) {
        trigger.kill();
      }
    });
  }
}

// 關鍵保險：監聽所有圖片載入完成後，強制刷新 ScrollTrigger
window.addEventListener("load", () => {
  scheduleScrollTriggerRefresh();
});

const paintingImages = document.querySelectorAll(".painting-item img");
paintingImages.forEach((img) => {
  if (img.complete) {
    scheduleScrollTriggerRefresh();
  } else {
    img.addEventListener("load", () => {
      scheduleScrollTriggerRefresh();
    });
  }
});

// 滾動自動隱藏導覽列功能 - 優化版本，更靈敏即時反應
let lastScrollTop = 0;
let ticking = false;

function handleScroll() {
  const navigation = document.querySelector(".navigation");
  if (!navigation) return;

  const currentScroll =
    window.pageYOffset || document.documentElement.scrollTop;

  // 避免在頁面頂部時隱藏導覽列
  if (currentScroll <= 0) {
    navigation.style.transform = "translateY(0)";
    lastScrollTop = 0;
    ticking = false;
    return;
  }

  // 計算滾動方向差異，讓觸發更靈敏
  const scrollDifference = currentScroll - lastScrollTop;

  // 向下滾動：隱藏導覽列（只要向下滾動就隱藏，無需閾值）
  if (scrollDifference > 0) {
    navigation.style.transform = "translateY(-100%)";
  }
  // 向上滾動：顯示導覽列（只要向上滾動就顯示）
  else if (scrollDifference < 0) {
    navigation.style.transform = "translateY(0)";
  }
  // 如果滾動位置沒有變化，保持當前狀態

  lastScrollTop = currentScroll;
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(handleScroll);
    ticking = true;
  }
}

// 4. 強制 JS 隱藏鼠標 (雙重保險)
// 確保連 CSS 失效時，JS 也能強制隱藏
// 強制將網頁游標設定為透明圖片
const transparentCursor =
  "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC'), none";

function forceHideCursor() {
  document.documentElement.style.cursor = transparentCursor;
  document.body.style.cursor = transparentCursor;
}

// 監聽視窗調整與載入
window.addEventListener("resize", forceHideCursor);
window.addEventListener("load", forceHideCursor);
forceHideCursor(); // 立即執行一次

// 監聽所有新生成的元素，防止破功
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.target.style) {
      mutation.target.style.cursor = transparentCursor;
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
});

// 鍵盤左右切換頁面功能
function initKeyboardNavigation() {
  const pageOrder = [
    "home",
    "bio",
    "calligraphy",
    "sealcarving",
    "painting",
    "exhibition",
  ];

  document.addEventListener("keydown", (e) => {
    // 只處理左右箭頭鍵，且不在輸入框中時
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
      return;
    }

    const currentPage = document.querySelector(".page.active");
    if (!currentPage) return;

    const currentPageId = currentPage.id;
    const currentIndex = pageOrder.indexOf(currentPageId);

    if (currentIndex === -1) return;

    let nextIndex;
    if (e.key === "ArrowLeft") {
      // 左鍵：上一頁（循環）
      nextIndex = currentIndex === 0 ? pageOrder.length - 1 : currentIndex - 1;
    } else if (e.key === "ArrowRight") {
      // 右鍵：下一頁（循環）
      nextIndex = (currentIndex + 1) % pageOrder.length;
    } else {
      return;
    }

    e.preventDefault();
    showPage(pageOrder[nextIndex]);
  });
}

// 手機版漢堡選單功能
function initMobileMenu() {
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const menuOverlay = document.getElementById("mobile-menu-overlay");
  const menuText = menuToggle?.querySelector(".menu-text");
  const body = document.body;
  const favicon = document.querySelector(".mobile-menu-favicon");

  if (!menuToggle || !menuOverlay || !menuText) return;

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMobileMenu();
  });

  // 點擊 favicon 前往首頁並關閉選單
  if (favicon) {
    favicon.addEventListener("click", (e) => {
      e.stopPropagation();
      showPage("home");
      toggleMobileMenu(); // 關閉選單
    });
    // 添加 cursor pointer 樣式提示可點擊
    favicon.style.cursor = "pointer";
  }

  // 點擊遮罩外部關閉選單
  menuOverlay.addEventListener("click", (e) => {
    if (e.target === menuOverlay) {
      toggleMobileMenu();
    }
  });
}

// 切換手機版漢堡選單
function toggleMobileMenu() {
  const menuToggle = document.getElementById("mobile-menu-toggle");
  const menuOverlay = document.getElementById("mobile-menu-overlay");
  const menuText = menuToggle?.querySelector(".menu-text");
  const body = document.body;

  if (!menuToggle || !menuOverlay || !menuText) return;

  const isActive = menuOverlay.classList.contains("active");

  if (isActive) {
    // 關閉選單
    menuOverlay.classList.remove("active");
    menuText.textContent = "MENU";
    menuToggle.classList.remove("menu-open");
    // 恢復原來的顏色（根據頁面狀態）
    menuToggle.style.color = "";
    body.style.overflow = "";
  } else {
    // 打開選單
    menuOverlay.classList.add("active");
    menuText.textContent = "CLOSE";
    menuToggle.classList.add("menu-open");
    // 選單打開時，CLOSE 按鈕變為深棕色
    menuToggle.style.color = "#24190b";
    body.style.overflow = "hidden"; // 防止背景滾動

    // 標記當前頁面對應的選單項目
    updateMobileMenuActiveState();
  }
}

// 更新手機版選單的當前頁面標記
function updateMobileMenuActiveState() {
  // 獲取當前活動的頁面
  const activePage = document.querySelector(".page.active");
  if (!activePage) return;

  const currentPageId = activePage.id;

  // 頁面 ID 與選單項目的對應關係
  const pageToMenuMap = {
    bio: "bio",
    calligraphy: "calligraphy",
    sealcarving: "sealcarving",
    painting: "painting",
    exhibition: "exhibition",
  };

  // 移除所有選單項目的 active 類
  const allMobileLinks = document.querySelectorAll(".mobile-nav-link");
  allMobileLinks.forEach((link) => {
    link.classList.remove("active");
  });

  // 如果當前頁面是首頁，所有選單項目都顯示深棕色
  if (currentPageId === "home") {
    allMobileLinks.forEach((link) => {
      link.classList.add("active");
    });
  }
  // 如果當前頁面在對應關係中，標記對應的選單項目
  else if (pageToMenuMap[currentPageId]) {
    // 找到對應的選單項目（通過 onclick 屬性中的 pageId）
    allMobileLinks.forEach((link) => {
      const onclickAttr = link.getAttribute("onclick");
      if (
        onclickAttr &&
        onclickAttr.includes(`'${pageToMenuMap[currentPageId]}'`)
      ) {
        link.classList.add("active");
      }
    });
  }
}

// 處理手機版選單項目點擊（包含動畫效果）
function handleMobileNavClick(pageId, linkElement) {
  // 獲取所有選單項目
  const allLinks = document.querySelectorAll(".mobile-nav-link");

  // 添加點擊動畫類（點擊的項目變深色）
  linkElement.classList.add("clicking");

  // 其他選單項目變淡色
  allLinks.forEach((link) => {
    if (link !== linkElement) {
      link.classList.add("fading");
    }
  });

  // 1.2秒後切換頁面並關閉選單
  setTimeout(() => {
    showPage(pageId);
    toggleMobileMenu();
    // 移除所有動畫類
    linkElement.classList.remove("clicking");
    allLinks.forEach((link) => {
      link.classList.remove("fading");
    });
  }, 1200);
}

// 觸控板左右滑動切換頁面功能
function initTrackpadSwipeNavigation() {
  const pageOrder = [
    "home",
    "bio",
    "calligraphy",
    "sealcarving",
    "painting",
    "exhibition",
  ];
  let lastSwipeTime = 0;
  const cooldownTime = 1000; // 1秒冷卻時間
  const minSwipeDistance = 50; // 最小滑動距離閾值
  let accumulatedDeltaX = 0; // 累積的橫向滑動距離
  let swipeTimeout = null; // 用於重置累積值的計時器

  // 使用 wheel 事件監聽觸控板滑動
  document.addEventListener(
    "wheel",
    (e) => {
      // 水平鎖定：確保是水平滑動而非垂直滑動
      // 如果垂直滑動幅度大於或等於水平滑動，則忽略
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
        // 垂直滑動，重置累積值
        accumulatedDeltaX = 0;
        if (swipeTimeout) {
          clearTimeout(swipeTimeout);
          swipeTimeout = null;
        }
        return;
      }

      // 檢查冷卻時間
      const currentTime = Date.now();
      if (currentTime - lastSwipeTime < cooldownTime) {
        return;
      }

      // 累積橫向滑動距離
      accumulatedDeltaX += e.deltaX;

      // 清除之前的重置計時器
      if (swipeTimeout) {
        clearTimeout(swipeTimeout);
      }

      // 設置重置計時器：如果 200ms 內沒有新的滑動事件，重置累積值
      swipeTimeout = setTimeout(() => {
        accumulatedDeltaX = 0;
        swipeTimeout = null;
      }, 200);

      // 檢查是否達到最小滑動距離
      if (Math.abs(accumulatedDeltaX) < minSwipeDistance) {
        return;
      }

      // 獲取當前頁面
      const currentPage = document.querySelector(".page.active");
      if (!currentPage) return;

      const currentPageId = currentPage.id;
      const currentIndex = pageOrder.indexOf(currentPageId);

      if (currentIndex === -1) return;

      // 判斷滑動方向並切換頁面
      let nextIndex;
      if (accumulatedDeltaX > 0) {
        // deltaX > 0：往右滑 → 下一頁 (Next)
        nextIndex = (currentIndex + 1) % pageOrder.length;
      } else {
        // deltaX < 0：往左滑 → 上一頁 (Previous)
        nextIndex = (currentIndex - 1 + pageOrder.length) % pageOrder.length;
      }

      // 執行頁面切換
      e.preventDefault();
      showPage(pageOrder[nextIndex]);

      // 更新冷卻時間和重置累積值
      lastSwipeTime = currentTime;
      accumulatedDeltaX = 0;
      if (swipeTimeout) {
        clearTimeout(swipeTimeout);
        swipeTimeout = null;
      }
    },
    { passive: false },
  ); // 使用 passive: false 以便可以 preventDefault
}

// 頁面載入時執行
// --- 全域圖片預載入：在頁面載入時就開始預載入篆刻照片 ---
const sealCarvingImages = [
  "images/seal carving/seal carving_01.webp",
  "images/seal carving/seal carving_02.webp",
  "images/seal carving/seal carving_03.webp",
  "images/seal carving/seal carving_04.webp",
  "images/seal carving/seal carving_05.webp",
  "images/seal carving/seal carving_06.webp",
];

// 預載入所有篆刻照片（在頁面載入時就開始）
function preloadSealCarvingImages() {
  if (window.sealCarvingImagesPreloaded) return;

  sealCarvingImages.forEach((src) => {
    const img = new Image();
    // 設置 fetchpriority 提示瀏覽器優先載入
    if ("fetchPriority" in img) {
      img.fetchPriority = "high";
    }
    img.src = src;
  });

  window.sealCarvingImagesPreloaded = true;
}

document.addEventListener("DOMContentLoaded", function () {
  // 立即開始預載入篆刻照片
  preloadSealCarvingImages();

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.config({
      ignoreMobileResize: true,
      limitCallbacks: true,
    });
  }

  initHeroSlideshow();
  showPage("home");
  initNavScrollSpy();
  // 初始化語言為英文（預設顯示英文）
  document.body.classList.add("lang-en");
  switchLanguage("en"); // 預設英文
  initGalleries(); // 初始化畫廊，確保第一張圖片有 active class
  hideSingleImageArrows(); // 隱藏單張圖片的箭頭
  initKeyboardNavigation(); // 初始化鍵盤導航
  initTrackpadSwipeNavigation(); // 初始化觸控板滑動導航
  initMobileMenu(); // 初始化手機版漢堡選單

  // 如果初始頁面是書法頁面，初始化觸控滑動功能
  const initialPage = document.querySelector(".page.active");
  if (initialPage && initialPage.id === "calligraphy") {
    setTimeout(() => {
      initCalligraphyTouchSwipe();
    }, 300);
  }

  // 視窗大小改變時重新初始化觸控滑動（手機版切換）
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const currentPage = document.querySelector(".page.active");
      if (currentPage && currentPage.id === "calligraphy") {
        initCalligraphyTouchSwipe();
      }
    }, 300);
  });

  // 添加滾動監聽事件
  window.addEventListener("scroll", onScroll, { passive: true });

  // 初始化自訂鼠標
  const cursor = document.getElementById("custom-cursor");

  if (cursor) {
    // 標記游標已準備好，才隱藏原生游標
    document.body.classList.add("cursor-ready");

    // 定義所有需要觸發「大圓圈」的元素選擇器
    // 包含：連結、按鈕、導覽列、圖片、以及任何 class 為 clickable 的東西
    const hoverSelectors = [
      "a",
      "button",
      ".navigation",
      ".logo",
      "img",
      ".arrow-btn",
      ".clickable",
    ];

    // 骰子精確碰撞檢測函數
    function isMouseOverCube(mouseX, mouseY) {
      const cube = document.getElementById("cube");
      if (!cube) return false;

      const rect = cube.getBoundingClientRect();
      // 檢查滑鼠原點是否在骰子的邊界內
      // 考慮骰子是 3D 旋轉的，所以使用一個稍微擴大的邊界框來容錯
      const padding = 20; // 容錯範圍
      return (
        mouseX >= rect.left - padding &&
        mouseX <= rect.right + padding &&
        mouseY >= rect.top - padding &&
        mouseY <= rect.bottom + padding
      );
    }

    // 1. 移動邏輯 (使用 requestAnimationFrame 優化性能)
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let rafId = null;
    let isAnimating = false;

    // 使用 requestAnimationFrame 平滑更新游標位置
    function updateCursor() {
      if (!isAnimating) return;

      // 使用緩動效果讓游標跟隨更順暢
      const dx = mouseX - cursorX;
      const dy = mouseY - cursorY;
      
      // 計算距離，如果太小就直接設定位置
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 0.5) {
        cursorX = mouseX;
        cursorY = mouseY;
      } else {
        cursorX += dx * 0.2;
        cursorY += dy * 0.2;
      }

      cursor.style.left = cursorX + "px";
      cursor.style.top = cursorY + "px";

      rafId = requestAnimationFrame(updateCursor);
    }

    // 啟動動畫循環
    isAnimating = true;
    updateCursor();

    // 清理：當頁面卸載時取消動畫循環
    window.addEventListener("beforeunload", () => {
      isAnimating = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    });

    // 確保游標始終跟隨滑鼠
    window.addEventListener(
      "mousemove",
      (e) => {
        // 顯示鼠標 (解決剛載入看不到的問題)
        if (cursor.style.opacity === "0") cursor.style.opacity = "1";

        // 更新目標位置
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 如果動畫停止了，重新啟動
        if (!isAnimating) {
          isAnimating = true;
          updateCursor();
        }
      },
      { passive: true },
    );

    // 2. 中央狀態監控 (Event Delegation)
    // 不要在每個元素上綁定事件，而是監聽整個 Body
    document.body.addEventListener("mouseover", (e) => {
      // 檢查滑鼠指到的東西，是否是我們定義的目標 (或目標的子元素)
      let target = e.target.closest(hoverSelectors.join(","));

      // 檢查滑鼠原點是否在骰子上
      const isOverCube = isMouseOverCube(e.clientX, e.clientY);

      if (target || isOverCube) {
        cursor.classList.add("hovered");
      } else {
        cursor.classList.remove("hovered");
      }
    });

    document.body.addEventListener("mouseout", (e) => {
      // 當滑鼠離開視窗或元素時的保險機制
      let target = e.target.closest(hoverSelectors.join(","));
      const isOverCube = isMouseOverCube(e.clientX, e.clientY);

      if (!target && !isOverCube) {
        cursor.classList.remove("hovered");
      }
    });

    // 額外監聽滑鼠移動，確保骰子檢測更精確
    window.addEventListener(
      "mousemove",
      (e) => {
        const isOverCube = isMouseOverCube(e.clientX, e.clientY);
        const target = e.target.closest(hoverSelectors.join(","));

        if (isOverCube || target) {
          cursor.classList.add("hovered");
        } else {
          cursor.classList.remove("hovered");
        }
      },
      { passive: true },
    );

    // 3. 點擊回饋 (MouseDown/Up) + 觸控支援
    const addClickedClass = () => cursor.classList.add("clicked");
    const removeClickedClass = () => cursor.classList.remove("clicked");
    
    document.addEventListener("mousedown", addClickedClass);
    document.addEventListener("mouseup", removeClickedClass);
    
    // 手機版觸控支援：大圓形跟隨手指移動，點擊後持續停留直到頁面跳轉
    let isTouchingInteractive = false;
    
    document.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        
        // 檢查是否點擊在可互動元素上（按鈕、連結、可點擊元素）
        const isInteractive = target && (
          target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.closest("button") ||
          target.closest("a") ||
          target.classList.contains("clickable") ||
          target.closest(".clickable") ||
          target.classList.contains("mobile-menu-toggle") ||
          target.closest(".mobile-menu-toggle") ||
          target.classList.contains("lang-btn") ||
          target.closest(".lang-btn") ||
          target.classList.contains("nav-link") ||
          target.closest(".nav-link") ||
          target.classList.contains("mobile-nav-link") ||
          target.closest(".mobile-nav-link")
        );
        
        // 只在點擊互動元素時顯示大圓形
        if (isInteractive) {
          isTouchingInteractive = true;
          mouseX = touch.clientX;
          mouseY = touch.clientY;
          cursorX = touch.clientX;
          cursorY = touch.clientY;
          cursor.style.left = cursorX + "px";
          cursor.style.top = cursorY + "px";
          cursor.classList.add("hovered");
          cursor.classList.add("clicked");
        }
      }
    }, { passive: true });
    
    // 手指移動時，大圓形跟隨移動（只在觸控互動元素時）
    document.addEventListener("touchmove", (e) => {
      if (isTouchingInteractive && e.touches.length === 1) {
        const touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        cursorX = touch.clientX;
        cursorY = touch.clientY;
        cursor.style.left = cursorX + "px";
        cursor.style.top = cursorY + "px";
      }
    }, { passive: true });
    
    // 手指離開時，大圓形持續停留在最後位置（不消失，讓頁面跳轉自然帶走）
    document.addEventListener("touchend", () => {
      // 不移除 hovered 和 clicked，讓大圓形持續停留
      // 等待頁面跳轉時自然消失
      isTouchingInteractive = false;
    }, { passive: true });
    
    document.addEventListener("touchcancel", () => {
      // touchcancel 時才移除（異常情況）
      cursor.classList.remove("hovered");
      cursor.classList.remove("clicked");
      isTouchingInteractive = false;
    }, { passive: true });
    
    // 視窗失焦或頁面隱藏時重置游標
    window.addEventListener("blur", () => {
      cursor.classList.remove("hovered");
      cursor.classList.remove("clicked");
    });
    
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cursor.classList.remove("hovered");
        cursor.classList.remove("clicked");
      }
    });
    
    // 頁面滾動時確保游標動畫正常運作
    let scrollTimeout;
    window.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // 滾動停止後檢查動畫是否還在運行
        if (!isAnimating && cursor.style.opacity !== "0") {
          isAnimating = true;
          updateCursor();
        }
      }, 100);
    }, { passive: true });
  }
});
// 圖片輪播功能
function changeImage(button, direction) {
  const gallery = button.closest(".image-gallery");
  if (!gallery) return;

  const container = gallery.querySelector(".gallery-container");
  if (!container) return;

  const images = container.querySelectorAll(".gallery-image");
  if (!images || images.length <= 1) return;

  // 找到當前顯示的圖片
  let currentIndex = -1;
  images.forEach((img, index) => {
    if (img.classList.contains("active")) {
      currentIndex = index;
    }
  });

  // 如果沒有找到活動圖片，設為第一張
  if (currentIndex === -1) {
    currentIndex = 0;
    // 防呆機制：確認元素存在後才存取 classList
    if (images[0]) {
      images[0].classList.add("active");
    }
  }

  // 計算下一張圖片的索引（循環）
  let nextIndex = currentIndex + direction;

  // 循環邏輯：如果小於0，跳到最後一張；如果大於等於長度，跳到第一張
  if (nextIndex < 0) {
    nextIndex = images.length - 1;
  } else if (nextIndex >= images.length) {
    nextIndex = 0;
  }

  // 切換圖片（加入防呆機制）
  if (
    currentIndex >= 0 &&
    currentIndex < images.length &&
    images[currentIndex]
  ) {
    images[currentIndex].classList.remove("active");
  }
  if (nextIndex >= 0 && nextIndex < images.length && images[nextIndex]) {
    images[nextIndex].classList.add("active");
  }

  // 確保只有一張圖片是活動的
  images.forEach((img, index) => {
    if (img && index !== nextIndex) {
      img.classList.remove("active");
    }
  });
}

// 書法頁面手機版：觸控滑動切換圖片功能
function initCalligraphyTouchSwipe() {
  // 只在手機版啟用（螢幕寬度 <= 768px）
  if (window.innerWidth > 768) return;

  const galleries = document.querySelectorAll("#calligraphy .image-gallery");
  if (!galleries.length) return;

  galleries.forEach((gallery) => {
    const container = gallery.querySelector(".gallery-container");
    if (!container) return;

    const images = container.querySelectorAll(".gallery-image");
    if (images.length <= 1) return; // 只有一張圖片時不需要滑動

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;
    const minSwipeDistance = 50; // 最小滑動距離（像素）

    // 觸控開始
    container.addEventListener(
      "touchstart",
      (e) => {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        isSwiping = false;
      },
      { passive: true },
    );

    // 觸控移動
    container.addEventListener(
      "touchmove",
      (e) => {
        const touch = e.touches[0];
        touchEndX = touch.clientX;
        touchEndY = touch.clientY;

        // 計算移動距離
        const deltaX = Math.abs(touchEndX - touchStartX);
        const deltaY = Math.abs(touchEndY - touchStartY);

        // 如果水平移動距離大於垂直移動距離，視為滑動
        if (deltaX > deltaY && deltaX > 10) {
          isSwiping = true;
        }
      },
      { passive: true },
    );

    // 觸控結束
    container.addEventListener(
      "touchend",
      (e) => {
        if (!isSwiping) return;

        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // 確保是水平滑動且距離足夠
        if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
          // 找到當前顯示的圖片
          let currentIndex = -1;
          images.forEach((img, index) => {
            if (img.classList.contains("active")) {
              currentIndex = index;
            }
          });

          if (currentIndex === -1) {
            currentIndex = 0;
            if (images[0]) {
              images[0].classList.add("active");
            }
          }

          // 判斷滑動方向
          let direction = 0;
          if (deltaX > 0) {
            // 向右滑 → 上一張
            direction = -1;
          } else {
            // 向左滑 → 下一張
            direction = 1;
          }

          // 計算下一張圖片的索引（循環）
          let nextIndex = currentIndex + direction;
          if (nextIndex < 0) {
            nextIndex = images.length - 1;
          } else if (nextIndex >= images.length) {
            nextIndex = 0;
          }

          // 切換圖片
          if (
            currentIndex >= 0 &&
            currentIndex < images.length &&
            images[currentIndex]
          ) {
            images[currentIndex].classList.remove("active");
          }
          if (
            nextIndex >= 0 &&
            nextIndex < images.length &&
            images[nextIndex]
          ) {
            images[nextIndex].classList.add("active");
          }

          // 確保只有一張圖片是活動的
          images.forEach((img, index) => {
            if (img && index !== nextIndex) {
              img.classList.remove("active");
            }
          });
        }

        // 重置狀態
        isSwiping = false;
        touchStartX = 0;
        touchStartY = 0;
        touchEndX = 0;
        touchEndY = 0;
      },
      { passive: true },
    );
  });
}

// ====== 展演頁面：強制修正與自動輪播補丁 ======
document.addEventListener("DOMContentLoaded", () => {
  // 給一點時間讓 JS 把照片畫出來 (0.5秒後執行)
  setTimeout(() => {
    // 1. 強制修正：把 2023 的「Active」標籤歸位到第一張
    const gallery2023 = document.getElementById("2023-left"); // 對應你資料裡的 ID
    if (gallery2023) {
      const images = gallery2023.querySelectorAll(".gallery-image");
      if (images.length > 0) {
        // 先移除所有人的 active (不管之前錯在哪)
        images.forEach((img) => img.classList.remove("active"));
        // 強制把第一張設為 active
        images[0].classList.add("active");
        console.log("已強制修正 2023 照片順序為第一張");
      }
    }

    // 2. 啟動自動輪播 (每 3 秒點擊一次下一張)
    setInterval(() => {
      // 抓取 2023 左邊展覽的「右箭頭」
      // 這裡假設按鈕結構是 button.arrow.right，位於 gallery2023 內或附近
      // 如果你的按鈕在 gallery 外面，請用 document.querySelectorAll('.arrow.right')
      const nextBtns = document.querySelectorAll(".arrow.right");

      nextBtns.forEach((btn) => {
        // 為了不干擾使用者操作，可以加個判斷：滑鼠沒懸停時才播 (可選)
        btn.click();
      });
    }, 3000); // 3000 = 3秒
  }, 500); // 延遲 500ms 確保 HTML 已經生成
});

// =========================================
// 展演頁面 JavaScript (Exhibition Page Scripts)
// =========================================
// 這些變數需要在 DOM 載入後才能獲取，所以包裝在 DOMContentLoaded 中
let path, heroPath, originDot, branchLeft, branchRight;

// 在 DOMContentLoaded 中初始化展演頁面相關的 DOM 元素引用
document.addEventListener("DOMContentLoaded", function () {
  path = document.getElementById("narrative-line");
  heroPath = document.getElementById("hero-path");
  originDot = document.getElementById("timeline-origin-dot");
  branchLeft = document.getElementById("branch-left");
  branchRight = document.getElementById("branch-right");
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }
});

// @cursor-instruction: User manually curates this order. DO NOT sort or reorder this array automatically.
const exhibitionData = [
  {
    year: "2023",
    exhibition: "一個象徵式的輕觸",
    yearId: "year-2023",
    left: {
      carouselId: "2023-left",
      caption:
        "《窮鄉兒女造像》、《陳鴻壽泡茶》、《凝視》｜一個象徵式的輕觸，北側藝術聚落",
      images: [
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/left-01.webp",
          alt: "一個象徵式的輕觸 1",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/left-02.webp",
          alt: "一個象徵式的輕觸 2",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/left-03.webp",
          alt: "一個象徵式的輕觸 3",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/left-04.webp",
          alt: "一個象徵式的輕觸 4",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/left-05.webp",
          alt: "一個象徵式的輕觸 3",
        },
      ],
    },
    right: {
      carouselId: "2023-right",
      caption: "展演日側拍",
      images: [
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/right-01.webp",
          alt: "展覽現場 1",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/right-02.webp",
          alt: "展覽現場 2",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/right-03.webp",
          alt: "展覽現場 3",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/right-04.webp",
          alt: "展覽現場 4",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/right-05.webp",
          alt: "展覽現場 5",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/right-06.webp",
          alt: "展覽現場 6",
        },
        {
          src: "images/exhibition/2023，一個象徵式的輕觸/right-07.webp",
          alt: "展覽現場 7",
        },
      ],
    },
  },
  {
    year: "2019",
    exhibition: "限時動態—超領域國際展",
    yearId: "year-2019",
    left: {
      carouselId: "2019-left",
      caption: "《ERR》｜限時動態—超領域國際展，北側藝術聚落",
      images: [
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-01.webp",
          alt: "限時動態 1",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-02.webp",
          alt: "限時動態 2",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-03.webp",
          alt: "限時動態 3",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-04.webp",
          alt: "限時動態 4",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-05.webp",
          alt: "限時動態 3",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-06.webp",
          alt: "限時動態 4",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-07.webp",
          alt: "限時動態 5",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-08.webp",
          alt: "限時動態 6",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-09.webp",
          alt: "限時動態 7",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/left-10.webp",
          alt: "限時動態 8",
        },
      ],
    },
    right: {
      carouselId: "2019-right",
      caption: "佈展側拍",
      images: [
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/right-01.webp",
          alt: "展覽現場 1",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/right-02.webp",
          alt: "展覽現場 2",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/right-03.webp",
          alt: "展覽現場 3",
        },
        {
          src: "images/exhibition/2019，限時動態——超領域國際展/right-04.webp",
          alt: "展覽現場 4",
        },
      ],
    },
  },
  {
    year: "2019",
    exhibition: "我在這",
    dataIndex: "2019-2",
    left: {
      carouselId: "2019-2-left",
      caption: "《建築體局部投影》｜我在這，北側藝術聚落",
      images: [
        {
          src: "images/exhibition/2019，我在這/left-01.webp",
          alt: "我在這 1",
        },
        {
          src: "images/exhibition/2019，我在這/left-02.webp",
          alt: "我在這 2",
        },
        {
          src: "images/exhibition/2019，我在這/left-03.webp",
          alt: "我在這 3",
        },
        {
          src: "images/exhibition/2019，我在這/left-04.webp",
          alt: "我在這 4",
        },
      ],
    },
    right: {
      carouselId: "2019-2-right",
      caption: "展演日側拍",
      images: [
        {
          src: "images/exhibition/2019，我在這/right-01.webp",
          alt: "展覽現場 1",
        },
        {
          src: "images/exhibition/2019，我在這/right-02.webp",
          alt: "展覽現場 2",
        },
        {
          src: "images/exhibition/2019，我在這/right-03.webp",
          alt: "展覽現場 3",
        },
        {
          src: "images/exhibition/2019，我在這/right-04.webp",
          alt: "展覽現場 4",
        },
        {
          src: "images/exhibition/2019，我在這/right-05.webp",
          alt: "展覽現場 5",
        },
        {
          src: "images/exhibition/2019，我在這/right-06.webp",
          alt: "展覽現場 6",
        },
        {
          src: "images/exhibition/2019，我在這/right-07.webp",
          alt: "展覽現場 7",
        },
        {
          src: "images/exhibition/2019，我在這/right-08.webp",
          alt: "展覽現場 8",
        },
        {
          src: "images/exhibition/2019，我在這/right-09.webp",
          alt: "展覽現場 9",
        },
        {
          src: "images/exhibition/2019，我在這/right-10.webp",
          alt: "展覽現場 10",
        },
        {
          src: "images/exhibition/2019，我在這/right-11.webp",
          alt: "展覽現場 11",
        },
        {
          src: "images/exhibition/2019，我在這/right-12.webp",
          alt: "展覽現場 12",
        },
        {
          src: "images/exhibition/2019，我在這/right-13.webp",
          alt: "展覽現場 13",
        },
      ],
    },
  },
  {
    year: "2018",
    exhibition: "人因風景",
    yearId: "year-2018",
    left: {
      carouselId: "2018-left",
      caption: "《屍袋燈管》｜人因風景，有章藝術博物館",
      images: [
        {
          src: "images/exhibition/2018，人因風景/left-01.webp",
          alt: "人因風景 1",
        },
        {
          src: "images/exhibition/2018，人因風景/left-02.webp",
          alt: "人因風景 2",
        },
        {
          src: "images/exhibition/2018，人因風景/left-03.webp",
          alt: "人因風景 3",
        },
        {
          src: "images/exhibition/2018，人因風景/left-04.webp",
          alt: "人因風景 4",
        },
        {
          src: "images/exhibition/2018，人因風景/left-05.webp",
          alt: "人因風景 5",
        },
      ],
    },
    right: {
      carouselId: "2018-right",
      caption: "佈展側拍",
      images: [
        {
          src: "images/exhibition/2018，人因風景/right-01.webp",
          alt: "展覽現場 1",
        },
        {
          src: "images/exhibition/2018，人因風景/right-02.webp",
          alt: "展覽現場 2",
        },
        {
          src: "images/exhibition/2018，人因風景/right-03.webp",
          alt: "展覽現場 3",
        },
        {
          src: "images/exhibition/2018，人因風景/right-04.webp",
          alt: "展覽現場 4",
        },
        {
          src: "images/exhibition/2018，人因風景/right-05.webp",
          alt: "展覽現場 5",
        },
      ],
    },
  },
  {
    year: "2017",
    exhibition: "實到0空間進行式",
    yearId: "year-2017",
    left: {
      carouselId: "2017-left",
      caption: "《氣泡紙》｜實到0空間進行式，臺灣藝術大學",
      images: [
        {
          src: "images/exhibition/2017，實到0空間進行式/left-01.webp",
          alt: "實到0空間進行式 1",
        },
        {
          src: "images/exhibition/2017，實到0空間進行式/left-02.webp",
          alt: "實到0空間進行式 2",
        },
        {
          src: "images/exhibition/2017，實到0空間進行式/left-03.webp",
          alt: "實到0空間進行式 3",
        },
        {
          src: "images/exhibition/2017，實到0空間進行式/left-04.webp",
          alt: "實到0空間進行式 4",
        },
      ],
    },
    right: {
      carouselId: "2017-right",
      caption: "佈展側拍",
      images: [
        {
          src: "images/exhibition/2017，實到0空間進行式/right-01.webp",
          alt: "展覽現場 1",
        },
        {
          src: "images/exhibition/2017，實到0空間進行式/right-02.webp",
          alt: "展覽現場 2",
        },
        {
          src: "images/exhibition/2017，實到0空間進行式/right-03.webp",
          alt: "展覽現場 3",
        },
        {
          src: "images/exhibition/2017，實到0空間進行式/right-04.webp",
          alt: "展覽現場 3",
        },
        {
          src: "images/exhibition/2017，實到0空間進行式/right-05.webp",
          alt: "展覽現場 5",
        },
      ],
    },
  },
];

function buildWorkColumn(columnData, columnClass) {
  const column = document.createElement("div");
  column.className = columnClass;

  const item = document.createElement("div");
  item.className = "work-item";
  item.setAttribute("data-scroll-reveal", "");

  const carousel = document.createElement("div");
  carousel.className = "work-carousel";
  carousel.dataset.carousel = columnData.carouselId;

  const track = document.createElement("div");
  track.className = "carousel-track";

  // 依照檔名中的數字順序排序（01、02、03...）
  const sortedImages = [...columnData.images].sort((a, b) => {
    const getNumber = (src) => {
      const match = src.match(/(\d+)\.(jpeg|jpg|png)/i);
      return match ? parseInt(match[1], 10) : 0;
    };
    return getNumber(a.src) - getNumber(b.src);
  });

  sortedImages.forEach((image) => {
    const slide = document.createElement("div");
    slide.className = "carousel-slide";

    const img = document.createElement("img");
    img.src = image.src;
    img.alt = image.alt;

    slide.appendChild(img);
    track.appendChild(slide);
  });

  const indicators = document.createElement("div");
  indicators.className = "carousel-indicators";
  sortedImages.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.className = index === 0 ? "carousel-dot active" : "carousel-dot";
    indicators.appendChild(dot);
  });

  carousel.appendChild(track);
  carousel.appendChild(indicators);

  const caption = document.createElement("div");
  caption.className = "work-caption";
  caption.textContent = columnData.caption;

  item.appendChild(carousel);
  item.appendChild(caption);
  column.appendChild(item);

  return column;
}

// 像在排分鏡：先定好展演順序，再把左右畫面逐格掛上
function renderExhibitionSections() {
  const container = document.getElementById("exhibition-sections");
  if (!container) return;
  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  exhibitionData.forEach((section) => {
    const sectionEl = document.createElement("div");
    sectionEl.className = "exhibition-section hidden";
    sectionEl.dataset.year = section.year;
    sectionEl.dataset.exhibition = section.exhibition;
    if (section.dataIndex) {
      sectionEl.dataset.index = section.dataIndex;
    }

    const yearBlock = document.createElement("div");
    yearBlock.className = "timeline-year";
    if (section.yearId) {
      yearBlock.id = section.yearId;
    }

    const title = document.createElement("h2");
    title.className = "year-title";
    title.textContent = section.year;

    const works = document.createElement("div");
    works.className = "timeline-works";
    works.appendChild(buildWorkColumn(section.left, "works-left"));
    works.appendChild(buildWorkColumn(section.right, "works-right"));

    yearBlock.appendChild(title);
    yearBlock.appendChild(works);
    sectionEl.appendChild(yearBlock);
    fragment.appendChild(sectionEl);
  });

  container.appendChild(fragment);
}

// 在 DOMContentLoaded 中調用，確保 DOM 已載入
document.addEventListener("DOMContentLoaded", function () {
  renderExhibitionSections();
});

// Carousel Management
const carouselTimers = new Map();
const carouselStartFunctions = new Map(); // 儲存每個輪播的啟動函數

function initCarousel(carouselElement) {
  if (!carouselElement || carouselElement.dataset.carouselReady === "true")
    return;
  const slides = carouselElement.querySelectorAll(".carousel-slide");
  const dots = carouselElement.querySelectorAll(".carousel-dot");
  const carouselId = carouselElement.getAttribute("data-carousel");

  if (!slides.length || !dots.length || !carouselId) return;

  let currentIndex = 0;

  // 確保所有圖片都載入完成，避免輪播卡住
  const images = carouselElement.querySelectorAll(".carousel-slide img");
  let loadedCount = 0;
  const totalImages = images.length;

  function checkAllImagesLoaded() {
    loadedCount++;
    if (loadedCount === totalImages) {
      // 所有圖片載入完成，初始化輪播
      initializeCarousel();
    }
  }

  // 為每張圖片添加載入監聽
  images.forEach((img) => {
    if (img.complete) {
      // 圖片已經載入完成
      checkAllImagesLoaded();
    } else {
      // 等待圖片載入
      img.addEventListener("load", checkAllImagesLoaded, { once: true });
      img.addEventListener("error", () => {
        // 圖片載入失敗，仍然計數，避免卡住
        console.warn(`圖片載入失敗: ${img.src}`);
        checkAllImagesLoaded();
      });
    }
  });

  // 如果沒有圖片，直接初始化
  if (totalImages === 0) {
    initializeCarousel();
  }

  function initializeCarousel() {
    // 確保第一張是 active
    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === 0);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === 0);
    });
    currentIndex = 0;
  }

  function updateCarousel(nextIndex) {
    if (
      nextIndex === currentIndex ||
      nextIndex < 0 ||
      nextIndex >= slides.length
    )
      return;

    // 確保索引有效
    if (slides[currentIndex]) {
      slides[currentIndex].classList.remove("active");
    }
    if (slides[nextIndex]) {
      slides[nextIndex].classList.add("active");
    }

    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === nextIndex);
    });
    currentIndex = nextIndex;
  }

  function resetToFirst() {
    // 重置到第一張（索引 0），確保按照 01、02、03 順序
    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === 0);
    });
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === 0);
    });
    currentIndex = 0;
  }

  function nextSlide() {
    // 確保按照順序輪播：01 -> 02 -> 03 -> ... -> 01
    const nextIndex = (currentIndex + 1) % slides.length;
    updateCarousel(nextIndex);
  }

  function startCarousel() {
    // 如果已經在運行，先停止
    if (carouselTimers.has(carouselId)) {
      stopCarousel();
    }

    // 先重置到第一張，確保從第一張（01）開始播放
    resetToFirst();

    // 等待 3 秒後再開始輪播到下一張
    const timer = setInterval(() => {
      try {
        nextSlide();
      } catch (error) {
        console.error(`輪播錯誤 (${carouselId}):`, error);
        // 發生錯誤時重置輪播
        resetToFirst();
      }
    }, 3000); // 3 seconds

    carouselTimers.set(carouselId, timer);
  }

  function stopCarousel() {
    if (!carouselTimers.has(carouselId)) return;
    clearInterval(carouselTimers.get(carouselId));
    carouselTimers.delete(carouselId);
  }

  // 儲存啟動函數，供外部調用
  carouselStartFunctions.set(carouselId, startCarousel);

  // 當元素進入視窗時啟動輪播，離開時停止
  const observeTarget =
    carouselElement.closest(".exhibition-section") || carouselElement;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 元素進入視窗，啟動輪播
          startCarousel();
        } else {
          // 元素離開視窗，停止輪播
          stopCarousel();
        }
      });
    },
    { threshold: 0.3 },
  );

  observer.observe(observeTarget);
  carouselElement.dataset.carouselReady = "true";
}

// === DOT-TO-LINE TIMELINE SYSTEM (Unified SVG) ===
const lineState = {
  dotRadius: 3.6,
  /* 縮小20%: 4.5 * 0.8 = 3.6 */
  dotOffset: 200, // 200px below navigation
  dotCx: 0,
  dotCy: 0,
  currentLength: 0,
  scrollLength: 0,
  maxLength: 0,
  introTimeline: null,
  scrollTrigger: null,
  intro2023Length: 600,
  horizonLocked: false,
  outroTimeline: null,
  outroTrigger: null,
  outroPadding: 28,
};

let sectionTriggers = [];
let timelineResizeObserver = null;
let refreshRaf = null;
let outroMeta = null;
let smoothLineTo = null;
const lineSmooth = {
  target: 0,
  raf: null,
  lerp: 0.3,
};
const imageRevealTimers = new WeakMap();
const IMAGE_REVEAL_DELAY = 2; // 年份先獨白 2 秒
const workItemObservers = new WeakMap();
const sectionRevealHandlers = new WeakMap();
const EXHIBITION_IDLE_REFRESH_MS = 60000;
let lastExhibitionScrollAt = Date.now();

function isExhibitionPageActive() {
  const activePage = document.querySelector(".page.active");
  return !!activePage && activePage.id === "exhibition";
}

function refreshExhibitionScrollState() {
  if (!isExhibitionPageActive()) return;
  scheduleTimelineRefresh();
  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.update(true);
  }
}

// 讓主線像鏡頭平移般平順：上下滾動都維持柔和跟隨
function applySmoothLineLength(length) {
  if (lineState.horizonLocked) {
    if (typeof gsap !== "undefined") {
      gsap.killTweensOf(lineState, "currentLength");
    }
    updateVerticalLine(lineState.maxLength);
    checkSectionTriggers(lineState.maxLength);
    updateOutroPaths(lineState.maxLength);
    return;
  }

  const targetLength = Math.max(0, length);

  // 直接更新，不使用平滑動畫，讓紅線緊跟滾動
  lineState.currentLength = targetLength;
  updateVerticalLine(targetLength);
  checkSectionTriggers(targetLength);
  // 只在頁尾時更新分支線條，其餘時間保持垂直線
  // updateOutroPaths 只在 horizonLocked 時才真正更新分支線條
}

function ensureExhibitionContentVisible() {
  const sections = document.querySelectorAll(".exhibition-section");
  sections.forEach((section) => {
    section.classList.remove("hidden");
    section.classList.add("exhibition-revealed");
    section.style.opacity = "1";
  });
  const workItems = document.querySelectorAll(".work-item");
  workItems.forEach((item) => {
    item.style.opacity = "1";
    item.style.clipPath = "inset(0 0 0% 0)";
  });
  const yearTitles = document.querySelectorAll(".year-title");
  yearTitles.forEach((title) => {
    title.style.opacity = "1";
    title.style.transform = "translateX(-50%)";
  });
}

function updateDotMetrics() {
  if (!heroPath) return;
  const nav = document.querySelector(".navigation");
  const navHeight = nav ? nav.getBoundingClientRect().height : 80;
  const rect = heroPath.getBoundingClientRect();
  const dotRadius = lineState.dotRadius;
  const width = rect.width || window.innerWidth;

  // 手機版：紅線往右邊移動貼齊照片的右側邊緣
  const isMobile = window.innerWidth <= 768;
  let dotCx;

  if (isMobile) {
    // 計算照片右側邊緣位置：照片寬度 448px + padding 20px
    const workItem = document.querySelector(".work-item");
    if (workItem) {
      const workItemRect = workItem.getBoundingClientRect();
      // 照片右側邊緣位置（相對於視窗）
      dotCx = workItemRect.right;
    } else {
      // 如果找不到照片，使用計算值：視窗寬度 - 20px (padding)
      dotCx = width - 20;
    }
  } else {
    dotCx = width * 0.5;
  }

  const dotCy = navHeight + lineState.dotOffset + dotRadius;

  lineState.dotCx = dotCx;
  lineState.dotCy = dotCy;

  if (originDot) {
    originDot.setAttribute("cx", dotCx);
    originDot.setAttribute("cy", dotCy);
    // 只有在動畫未開始或已完成時才設置半徑，動畫進行中讓動畫控制
    if (!lineState.introTimeline || !lineState.introTimeline.isActive()) {
      // 手機版：縮小紅圓點20%
      const mobileRadius = isMobile ? dotRadius * 0.8 : dotRadius;
      // 如果動畫還沒開始，保持當前狀態（可能是 0，由 initIntroAnimation 設置）
      // 如果動畫已完成，設置為正常大小
      const currentRadius = parseFloat(originDot.getAttribute("r")) || 0;
      if (currentRadius > 0 || !lineState.introTimeline) {
        // 動畫已完成或還沒初始化，設置為正常大小
        originDot.setAttribute("r", mobileRadius);
      }
      // 如果 currentRadius 是 0 且 introTimeline 存在，說明動畫還沒開始，保持 0
    }
  }
}

// 純垂直線條：從圓點中心向下延伸
function updateVerticalLine(length = 0) {
  if (!path) return lineState.dotCy;

  const hasMax =
    Number.isFinite(lineState.maxLength) && lineState.maxLength > 0;
  const clampedLength = Math.max(
    0,
    hasMax ? Math.min(length, lineState.maxLength) : length,
  );
  const endY = lineState.dotCy + clampedLength;

  // 使用原本的 dotCx 計算路徑（xPercent 由 GSAP matchMedia 處理）
  const d = `M ${lineState.dotCx} ${lineState.dotCy} L ${lineState.dotCx} ${endY}`;
  path.setAttribute("d", d);

  lineState.currentLength = clampedLength;
  return endY;
}

function calculateMaxLength() {
  const timelineContainer = document.querySelector(".timeline-container");
  if (!timelineContainer) return 0;
  updateDotMetrics();

  const containerTop =
    timelineContainer.getBoundingClientRect().top + window.scrollY;
  const footer = document.querySelector(
    "#exhibition .page-container .copyright",
  );

  let targetBottom =
    timelineContainer.getBoundingClientRect().bottom + window.scrollY;
  if (footer) {
    targetBottom = footer.getBoundingClientRect().top + window.scrollY;
  }

  const rawLength = targetBottom - containerTop - lineState.dotCy;
  const maxLength = Math.max(rawLength, lineState.dotRadius * 2);
  lineState.maxLength = maxLength;

  if (heroPath) {
    heroPath.style.height = `${maxLength + lineState.dotCy + 200}px`;
  }

  return maxLength;
}

function cacheSectionTriggers() {
  const timelineContainer = document.querySelector(".timeline-container");
  if (!timelineContainer) return;
  updateDotMetrics();

  sectionTriggers = Array.from(
    document.querySelectorAll(".exhibition-section"),
  ).map((section) => {
    const yearBlock = section.querySelector(".timeline-year") || section;
    const sectionTop = yearBlock.getBoundingClientRect().top + window.scrollY;
    const containerTop =
      timelineContainer.getBoundingClientRect().top + window.scrollY;
    const triggerLength = sectionTop - containerTop - lineState.dotCy + 150;

    section.dataset.triggerLength = String(triggerLength);
    return { section, triggerLength };
  });
}

function updateIntroLength() {
  if (sectionTriggers.length > 0) {
    const first = sectionTriggers[0];
    lineState.intro2023Length = Math.max(
      first.triggerLength,
      lineState.dotRadius * 2,
    );
  }
}

// 像鏡頭固定在地平線：尾奏進行時主線暫鎖在最底端
function lockMainLineAtBottom() {
  lineState.horizonLocked = true;
  if (!Number.isFinite(lineState.maxLength) || lineState.maxLength <= 0) return;
  updateVerticalLine(lineState.maxLength);
}

// 尾奏收束後把鏡頭交回滑動，主線回到 1:1 跟隨
function unlockMainLineToScroll() {
  lineState.horizonLocked = false;
  // 立即隱藏分支線條，只顯示垂直線
  if (branchLeft && branchRight) {
    gsap.set([branchLeft, branchRight], { opacity: 0 });
  }
  const targetLength = Number.isFinite(lineState.scrollLength)
    ? lineState.scrollLength
    : lineState.currentLength;
  applySmoothLineLength(targetLength);
}

function updateOutroPaths(lengthOverride, forceUpdate = false) {
  if (!branchLeft || !branchRight || !heroPath) return;

  // 只在頁尾（horizonLocked）時才更新分支線條，其餘時間保持隱藏
  // forceUpdate 參數允許在 resetOutroElements 時強制更新
  if (!lineState.horizonLocked && !forceUpdate) {
    // 確保分支線條在非頁尾時保持隱藏
    gsap.set([branchLeft, branchRight], { opacity: 0 });
    return;
  }

  updateDotMetrics();

  const rect = heroPath.getBoundingClientRect();
  const width = rect.width || window.innerWidth;
  const padding = lineState.outroPadding;
  const tipX = lineState.dotCx;
  const baseLength = Number.isFinite(lengthOverride)
    ? lengthOverride
    : Number.isFinite(lineState.currentLength)
      ? lineState.currentLength
      : lineState.maxLength;
  const maxLength =
    Number.isFinite(lineState.maxLength) && lineState.maxLength > 0
      ? lineState.maxLength
      : baseLength;
  const tipY = lineState.dotCy + Math.max(0, Math.min(baseLength, maxLength));
  const leftX = padding;
  const rightX = Math.max(width - padding, leftX + 40);

  const leftHoriz = Math.abs(tipX - leftX);
  const rightHoriz = Math.abs(rightX - tipX);

  branchLeft.setAttribute("d", `M ${tipX} ${tipY} L ${leftX} ${tipY}`);
  branchRight.setAttribute("d", `M ${tipX} ${tipY} L ${rightX} ${tipY}`);

  outroMeta = {
    tipX,
    tipY,
    leftX,
    rightX,
    leftLen: leftHoriz,
    rightLen: rightHoriz,
    leftHoriz,
    rightHoriz,
  };
}

function resetOutroElements(lengthOverride) {
  if (!branchLeft || !branchRight) return;
  // 強制更新分支線條路徑（即使 horizonLocked 尚未設置）
  updateOutroPaths(lengthOverride, true);
  if (!outroMeta) return;

  gsap.set([branchLeft, branchRight], {
    opacity: 0.7,
    strokeDasharray: (i) => (i === 0 ? outroMeta.leftLen : outroMeta.rightLen),
    strokeDashoffset: (i) => (i === 0 ? outroMeta.leftLen : outroMeta.rightLen),
  });

  // no bubbles in horizon fade
}

function buildHorizonTimeline() {
  if (typeof gsap === "undefined") return null;
  // 確保在構建動畫時，分支線條已經正確更新
  // 使用 forceUpdate 確保即使 horizonLocked 尚未設置也能更新
  resetOutroElements(lineState.maxLength);
  if (!outroMeta) {
    console.warn("[buildHorizonTimeline] outroMeta is null, retrying...");
    // 如果 outroMeta 為 null，可能是因為 updateOutroPaths 提前返回了
    // 強制設置 horizonLocked 並重試
    const wasLocked = lineState.horizonLocked;
    lineState.horizonLocked = true;
    updateOutroPaths(lineState.maxLength, true);
    lineState.horizonLocked = wasLocked;
    if (!outroMeta) {
      console.error("[buildHorizonTimeline] Failed to create outroMeta");
      return null;
    }
  }

  const branches = [branchLeft, branchRight].filter(Boolean);
  const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

  // 3.5s：向兩側緩伸，同步淡出到 0
  // 動畫只播放一次，不反向（刪除收回過程）
  tl.to(branchLeft, { strokeDashoffset: 0, duration: 3.5 }, 0)
    .to(branchRight, { strokeDashoffset: 0, duration: 3.5 }, 0)
    .to(branches, { opacity: 0, duration: 3.5 }, 0);

  // 動畫完成後，確保分支線條保持隱藏
  tl.eventCallback("onComplete", () => {
    gsap.set([branchLeft, branchRight], { opacity: 0 });
  });

  return tl;
}

function initHorizonTrigger() {
  const footer = document.querySelector(
    "#exhibition .page-container .copyright",
  );
  if (
    !footer ||
    typeof gsap === "undefined" ||
    typeof ScrollTrigger === "undefined"
  ) {
    console.log("[HorizonTrigger] missing trigger", footer);
    return;
  }
  console.log(
    "[HorizonTrigger] trigger",
    footer,
    "height",
    footer.getBoundingClientRect().height,
  );

  if (lineState.outroTrigger) {
    lineState.outroTrigger.kill();
    lineState.outroTrigger = null;
  }
  if (lineState.outroTimeline) {
    lineState.outroTimeline.kill();
    lineState.outroTimeline = null;
  }

  lineState.outroTimeline = buildHorizonTimeline();
  if (!lineState.outroTimeline) return;

  lineState.outroTrigger = ScrollTrigger.create({
    trigger: footer,
    start: "top bottom",
    end: "bottom bottom",
    animation: lineState.outroTimeline,
    toggleActions: "play none none none", // 只播放一次，不反向（刪除收回過程）
    invalidateOnRefresh: true,
    onEnter: () => {
      // 使用者滑到最底部時，線往兩側水平展開3.5秒後消失
      lockMainLineAtBottom();
      resetOutroElements(lineState.maxLength);
      // 播放動畫
      if (lineState.outroTimeline) {
        lineState.outroTimeline.play();
      }
    },
    onLeaveBack: () => {
      // 往上滑動時，立即隱藏分支線條，只顯示垂直線
      unlockMainLineToScroll();
      gsap.set([branchLeft, branchRight], { opacity: 0 });
    },
  });
}

function scheduleTimelineRefresh() {
  if (refreshRaf) {
    cancelAnimationFrame(refreshRaf);
  }
  refreshRaf = requestAnimationFrame(() => {
    refreshRaf = null;
    calculateMaxLength();
    cacheSectionTriggers();
    updateIntroLength();
    // 只在頁尾（horizonLocked）時更新分支線條，往上滑動時保持垂直線
    if (lineState.horizonLocked) {
      updateOutroPaths(lineState.maxLength);
    } else {
      // 確保分支線條在非頁尾時保持隱藏
      if (branchLeft && branchRight) {
        gsap.set([branchLeft, branchRight], { opacity: 0 });
      }
    }
    initHorizonTrigger();

    // 只有在 intro 動畫完成後（ScrollTrigger 已啟動）才根據滾動位置更新
    // 否則保持當前長度（通常是 0 或 intro 動畫中的長度）
    if (lineState.horizonLocked) {
      updateVerticalLine(lineState.maxLength);
    } else if (lineState.scrollTrigger && lineState.scrollTrigger.isActive) {
      // ScrollTrigger 已啟動，根據滾動位置更新
      const refreshLength =
        Number.isFinite(lineState.scrollLength) && lineState.scrollLength > 0
          ? lineState.scrollLength
          : lineState.currentLength;
      updateVerticalLine(refreshLength);
    } else {
      // Intro 動畫還沒完成，保持當前長度（不根據滾動位置）
      updateVerticalLine(lineState.currentLength);
    }

    if (typeof ScrollTrigger !== "undefined") {
      ScrollTrigger.refresh();
    }
  });
}

function bindTimelineObservers() {
  const timelineContainer = document.querySelector(".timeline-container");
  if (!timelineContainer) return;

  if (!timelineResizeObserver && typeof ResizeObserver !== "undefined") {
    timelineResizeObserver = new ResizeObserver(() => {
      scheduleTimelineRefresh();
    });
    timelineResizeObserver.observe(timelineContainer);
  }

  const images = timelineContainer.querySelectorAll("img");
  images.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", scheduleTimelineRefresh, { once: true });
  });
}

function cleanupTimelineObservers() {
  if (timelineResizeObserver) {
    timelineResizeObserver.disconnect();
    timelineResizeObserver = null;
  }
}

function revealExhibitionSection(section) {
  if (!section || section.classList.contains("exhibition-revealed")) return;

  section.classList.add("exhibition-revealed");
  section.classList.remove("hidden");
  // 進場時先刷新紅線計算，避免久停後同步錯位
  scheduleTimelineRefresh();

  const yearTitle = section.querySelector(".year-title");
  const workItems = section.querySelectorAll(".work-item");

  // Year title fade in - 年代標題動畫完成後才啟動輪播和顯示照片
  const revealWorkItem = (item) => {
    if (!item || item.dataset.revealed === "true") return;
    item.dataset.revealed = "true";
    if (typeof gsap !== "undefined") {
      // 照片顯示動畫（scale 由 matchMedia 在初始化時設置）
      gsap.fromTo(
        item,
        { opacity: 0, clipPath: "inset(0 0 100% 0)" },
        {
          opacity: 1,
          clipPath: "inset(0 0 0% 0)",
          duration: 1.8,
          ease: "power2.out",
        },
      );
    } else {
      item.style.opacity = "1";
      item.style.clipPath = "inset(0 0 0% 0)";
    }
  };

  const setupWorkItemObserver = () => {
    if (workItemObservers.has(section)) return;
    if (typeof IntersectionObserver === "undefined") {
      workItems.forEach(revealWorkItem);
      section.dataset.imagesRevealed = "true";
      return;
    }

    const revealAllWorkItems = () => {
      if (section.dataset.lineReady !== "true") return;
      workItems.forEach(revealWorkItem);
      section.dataset.imagesRevealed = "true";
    };

    const observer = new IntersectionObserver(
      (entries, io) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (section.dataset.lineReady !== "true") return;
          revealAllWorkItems();
          io.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.25,
        rootMargin: "120px 0px",
      },
    );

    const observeTarget = section.querySelector(".timeline-year") || section;
    observer.observe(observeTarget);
    workItemObservers.set(section, observer);
    sectionRevealHandlers.set(section, revealAllWorkItems);

    // 首幀檢查：若已在視窗內，立即顯示
    requestAnimationFrame(revealAllWorkItems);

    // 兜底：避免 IO 在長時間停留後失效，強制顯示
    setTimeout(() => {
      const anyRevealed = Array.from(workItems).some(
        (item) => item.dataset.revealed === "true",
      );
      if (!anyRevealed) {
        revealAllWorkItems();
      }
    }, 1500);
  };

  if (yearTitle && typeof gsap !== "undefined") {
    gsap.fromTo(
      yearTitle,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        ease: "power1.out",
        onComplete: () => {
          // 年代標題動畫完成後，啟動該 section 的所有輪播
          const carousels = section.querySelectorAll(".work-carousel");
          carousels.forEach((carousel) => {
            const carouselId = carousel.getAttribute("data-carousel");
            if (carouselId && carouselStartFunctions.has(carouselId)) {
              carouselStartFunctions.get(carouselId)();
            }
          });

          // 年代出現後再監聽照片進場（用鏡頭進場感，進入視窗才顯示）
          if (section.dataset.imagesRevealScheduled !== "true") {
            section.dataset.imagesRevealScheduled = "true";
            gsap.delayedCall(0.5, setupWorkItemObserver);
          }
        },
      },
    );
  } else {
    // 如果沒有 GSAP，直接啟動輪播和顯示照片
    const carousels = section.querySelectorAll(".work-carousel");
    carousels.forEach((carousel) => {
      const carouselId = carousel.getAttribute("data-carousel");
      if (carouselId && carouselStartFunctions.has(carouselId)) {
        carouselStartFunctions.get(carouselId)();
      }
    });

    if (section.dataset.imagesRevealScheduled !== "true") {
      section.dataset.imagesRevealScheduled = "true";
      setTimeout(setupWorkItemObserver, 500); // 0.5 秒後監聽進場顯示
    }
  }
}

function checkSectionTriggers(currentLength) {
  sectionTriggers.forEach(({ section, triggerLength }) => {
    if (currentLength >= triggerLength) {
      section.dataset.lineReady = "true";
      const handler = sectionRevealHandlers.get(section);
      if (handler) {
        handler();
      }
      revealExhibitionSection(section);
    }
  });
}

function cleanupAnimations() {
  if (lineState.introTimeline) {
    lineState.introTimeline.kill();
    lineState.introTimeline = null;
  }
  if (lineState.scrollTrigger) {
    lineState.scrollTrigger.kill();
    lineState.scrollTrigger = null;
  }
  if (lineState.outroTrigger) {
    lineState.outroTrigger.kill();
    lineState.outroTrigger = null;
  }
  if (lineState.outroTimeline) {
    lineState.outroTimeline.kill();
    lineState.outroTimeline = null;
  }
}

// === INTRO ANIMATION: Dot -> Line grows down, auto-reveals 2023 ===
function initIntroAnimation() {
  if (typeof gsap === "undefined" || !path) {
    ensureExhibitionContentVisible();
    return;
  }

  cleanupAnimations();
  // 強制更新圓點和紅線位置（但不設置半徑，讓動畫來控制）
  updateDotMetrics();
  calculateMaxLength();
  cacheSectionTriggers();
  updateIntroLength();

  // 強制重置：初始化線條為0長度，重置所有狀態
  lineState.currentLength = 0;
  lineState.scrollLength = 0;
  updateVerticalLine(0);

  // 設置紅點初始狀態：小到無法被看見（r=0），動畫會讓它變大
  if (originDot) {
    originDot.setAttribute("r", 0);
  }

  // 重置所有 section 的顯示狀態
  const sections = document.querySelectorAll(".exhibition-section");
  sections.forEach((section) => {
    section.classList.remove("exhibition-revealed");
    section.classList.add("hidden");
    section.dataset.imagesRevealScheduled = "false";
    section.dataset.imagesRevealed = "false";
  });

  const pathLength = path.getTotalLength();
  gsap.set(path, {
    strokeDasharray: pathLength,
    strokeDashoffset: pathLength,
  });

  // 手機版：縮小紅圓點20%
  const isMobile = window.innerWidth <= 768;
  const targetRadius = isMobile
    ? lineState.dotRadius * 0.8
    : lineState.dotRadius;

  // 設置紅點初始狀態：小到無法被看見（r=0）
  // 確保在動畫開始前，半徑為 0（無論桌面版或手機版）
  if (originDot) {
    originDot.setAttribute("r", 0);
    gsap.set(originDot, { attr: { r: 0 } });
  }

  // GSAP Timeline: 桌面版保留紅點放大，平板/手機紅點固定不動畫
  const isDesktop = window.matchMedia("(min-width: 1025px)").matches;
  const dotDuration = isDesktop ? 2.0 : 0;
  if (!isDesktop && originDot) {
    originDot.setAttribute("r", targetRadius);
    gsap.set(originDot, { attr: { r: targetRadius } });
  }
  const lineDuration = 2.5;
  const totalDuration = dotDuration + lineDuration;
  lineState.introTimeline = gsap.timeline({
    onUpdate: function () {
      // 在動畫過程中即時檢查觸發（只在紅線延伸階段）
      const totalProgress = this.progress();
      const dotAnimationProgress =
        totalDuration > 0 ? dotDuration / totalDuration : 0;
      if (totalProgress >= dotAnimationProgress) {
        const lineProgress =
          dotDuration === 0
            ? totalProgress
            : (totalProgress - dotAnimationProgress) /
              (1 - dotAnimationProgress);
        const currentLength = lineProgress * lineState.intro2023Length;
        checkSectionTriggers(currentLength);
      }
    },
    onComplete: () => {
      // 清除 stroke-dasharray，準備交給 ScrollTrigger
      path.style.strokeDasharray = "none";
      path.style.strokeDashoffset = "0";
      initScrollControlledExtension();
    },
  });

  // 桌面版紅點放大（手機版略過）
  if (originDot && dotDuration > 0) {
    lineState.introTimeline.to(
      originDot,
      {
        attr: { r: targetRadius },
        duration: dotDuration,
        ease: "power2.out",
      },
      0,
    );
  }

  // 紅線從圓點向下延伸（延伸到覆蓋 2023 section）
  lineState.introTimeline.to(
    lineState,
    {
      currentLength: lineState.intro2023Length,
      duration: lineDuration,
      ease: "power2.out",
      onUpdate: () => {
        updateVerticalLine(lineState.currentLength);
        gsap.set(path, {
          strokeDashoffset:
            pathLength *
            (1 - lineState.currentLength / lineState.intro2023Length),
        });
      },
    },
    dotDuration,
  );
}

// === SCROLL-CONTROLLED EXTENSION (After Intro) ===
function initScrollControlledExtension() {
  if (typeof ScrollTrigger === "undefined") {
    ensureExhibitionContentVisible();
    return;
  }

  const timelineContainer = document.querySelector(".timeline-container");
  if (!timelineContainer) {
    ensureExhibitionContentVisible();
    return;
  }

  if (lineState.scrollTrigger) {
    lineState.scrollTrigger.kill();
  }

  // Scrub-based line extension with TIGHT 1:1 tracking - 緊跟滾動
  // 重置 scrollLength，確保從 intro 結束的位置開始
  lineState.scrollLength = lineState.intro2023Length;

  lineState.scrollTrigger = ScrollTrigger.create({
    trigger: timelineContainer,
    start: "top top",
    end: "bottom bottom",
    scrub: true, // 改為 true，讓動畫完全即時跟隨滾動，無延遲
    invalidateOnRefresh: true,
    ease: "none", // CRITICAL: Force linear, no easing whatsoever
    onUpdate: (self) => {
      const progress = self.progress;
      // Linear interpolation from intro end to max length
      const targetLength =
        lineState.intro2023Length +
        progress * (lineState.maxLength - lineState.intro2023Length);
      const clampedLength =
        Number.isFinite(lineState.maxLength) && lineState.maxLength > 0
          ? Math.max(0, Math.min(targetLength, lineState.maxLength))
          : Math.max(0, targetLength);

      lineState.scrollLength = clampedLength;
      // 直接更新，不使用平滑動畫，讓紅線緊跟滾動
      lineState.currentLength = clampedLength;
      updateVerticalLine(clampedLength);
      checkSectionTriggers(clampedLength);
      updateOutroPaths(clampedLength);
    },
    // 初始化時，如果頁面已經滾動到展演區域，也要從 intro 結束的位置開始
    onEnter: () => {
      // 確保從 intro 結束的位置開始
      if (lineState.scrollLength < lineState.intro2023Length) {
        lineState.scrollLength = lineState.intro2023Length;
        applySmoothLineLength(lineState.intro2023Length);
      }
    },
  });
  initHorizonTrigger();
}

// === MAIN INIT ===
function initUnfurlingScrollAnimation() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    ensureExhibitionContentVisible();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // 使用 GSAP matchMedia 實現響應式動畫
  const mm = gsap.matchMedia();

  // 桌面版（min-width: 1025px）：保持原本的動畫邏輯
  mm.add("(min-width: 1025px)", () => {
    // 桌面版：紅線居中，照片正常大小
    if (path) {
      gsap.set(path, { xPercent: 0 });
    }

    // 重置所有照片為正常大小
    const allWorkItems = document.querySelectorAll(".work-item");
    allWorkItems.forEach((item) => {
      gsap.set(item, { scale: 1 });
    });
  });

  // 手機版（max-width: 1024px）：照片縮小 0.7、紅線貼齊照片右側邊緣
  mm.add("(max-width: 1024px)", () => {
    // 手機版：紅線位置由 updateDotMetrics 動態計算，貼齊照片右側邊緣
    // 不在此處設置 xPercent，讓 JavaScript 動態計算位置

    // 所有照片縮小至 0.7
    const allWorkItems = document.querySelectorAll(".work-item");
    allWorkItems.forEach((item) => {
      gsap.set(item, { scale: 0.7 });
    });

    // 確保紅線位置更新
    scheduleTimelineRefresh();
  });

  // 先重置所有狀態，確保從頭開始
  lineState.currentLength = 0;
  lineState.scrollLength = 0;

  // 隱藏所有 section，等待動畫觸發
  const sections = document.querySelectorAll(".exhibition-section");
  sections.forEach((section) => {
    section.classList.remove("exhibition-revealed");
    section.classList.add("hidden");
    section.dataset.imagesRevealScheduled = "false";
    section.dataset.imagesRevealed = "false";
  });

  // Initialize all carousels
  const carousels = document.querySelectorAll(".work-carousel");
  carousels.forEach((carousel) => {
    initCarousel(carousel);
  });

  bindTimelineObservers();

  // 強制更新圓點和紅線位置
  updateDotMetrics();
  // 先計算長度，但不更新紅線位置（保持為 0）
  calculateMaxLength();
  cacheSectionTriggers();
  updateIntroLength();

  // 立即更新垂直線條位置（即使長度為0，也要確保從正確的起始位置開始）
  updateVerticalLine(0);

  // Start intro animation after brief delay
  setTimeout(() => {
    initIntroAnimation();
  }, 200);
}

// === EVENT LISTENERS ===
document.addEventListener("exhibitionPageToggled", (event) => {
  const active = !!event.detail?.active;
  if (!active) {
    carouselTimers.forEach((timer) => clearInterval(timer));
    carouselTimers.clear();
    carouselStartFunctions.clear();
    cleanupAnimations();
    cleanupTimelineObservers();
    if (lineState.outroTrigger) {
      lineState.outroTrigger.kill();
      lineState.outroTrigger = null;
    }
    return;
  }
  try {
    setTimeout(() => {
      // 強制更新圓點和紅線位置
      updateDotMetrics();
      initUnfurlingScrollAnimation();
      lastExhibitionScrollAt = Date.now();
    }, 100);
  } catch (error) {
    console.error("Exhibition animation init failed:", error);
    ensureExhibitionContentVisible();
  }
});

window.addEventListener("resize", () => {
  if (!path) return;
  scheduleTimelineRefresh();
});

window.addEventListener(
  "scroll",
  () => {
    if (!isExhibitionPageActive()) return;
    const now = Date.now();
    if (now - lastExhibitionScrollAt > EXHIBITION_IDLE_REFRESH_MS) {
      refreshExhibitionScrollState();
    }
    lastExhibitionScrollAt = now;
  },
  { passive: true },
);

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshExhibitionScrollState();
  }
});

window.addEventListener("pageshow", () => {
  refreshExhibitionScrollState();
});

window.addEventListener("focus", () => {
  refreshExhibitionScrollState();
});

if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", () => {
    if (!isExhibitionPageActive()) return;
    scheduleTimelineRefresh();
  });
}

// =========================================
// 篆刻頁面：3D 立方體互動邏輯 (GSAP + 動態光影)
// =========================================
function initSealCarvingDice() {
  const cube = document.getElementById("cube");
  const sceneContainer = document.querySelector(".scene-container");

  if (!cube || !sceneContainer || typeof gsap === "undefined") return;

  // --- 圖片預載入：確保所有骰子照片快速載入（不影響顯示） ---
  // 預載入圖片但不阻塞骰子顯示
  if (!window.sealCarvingImagesPreloaded) {
    preloadSealCarvingImages();
  }

  // --- 3D 光影運算引擎 ---

  // 定義六個面的原始法向量 (Normal Vectors)
  // 順序對應 HTML: Front, Back, Right, Left, Top, Bottom
  const faceNormals = [
    {
      name: "front",
      x: 0,
      y: 0,
      z: 1,
      el: document.querySelector(".face-front"),
    },
    {
      name: "back",
      x: 0,
      y: 0,
      z: -1,
      el: document.querySelector(".face-back"),
    },
    {
      name: "right",
      x: 1,
      y: 0,
      z: 0,
      el: document.querySelector(".face-right"),
    },
    {
      name: "left",
      x: -1,
      y: 0,
      z: 0,
      el: document.querySelector(".face-left"),
    },
    { name: "top", x: 0, y: 1, z: 0, el: document.querySelector(".face-top") },
    {
      name: "bottom",
      x: 0,
      y: -1,
      z: 0,
      el: document.querySelector(".face-bottom"),
    },
  ];

  // 向量旋轉函數 (數學核心)
  function rotateVector(x, y, z, rx, ry) {
    // 將角度轉為弧度
    const radX = rx * (Math.PI / 180);
    const radY = ry * (Math.PI / 180);

    // 1. 先繞 X 軸旋轉 (影響 y 和 z)
    // y' = y*cos(θ) - z*sin(θ)
    // z' = y*sin(θ) + z*cos(θ)
    let y1 = y * Math.cos(radX) - z * Math.sin(radX);
    let z1 = y * Math.sin(radX) + z * Math.cos(radX);
    let x1 = x; // x 不變

    // 2. 再繞 Y 軸旋轉 (影響 x 和 z)
    // 注意：CSS 的 rotateY 軸向定義可能需要反轉 sin 的方向以配合視覺
    let x2 = x1 * Math.cos(radY) + z1 * Math.sin(radY);
    let z2 = -x1 * Math.sin(radY) + z1 * Math.cos(radY);
    let y2 = y1; // y 不變

    return { x: x2, y: y2, z: z2 };
  }

  // 更新光影的主函數
  function updateLighting(rotationX, rotationY) {
    faceNormals.forEach((face) => {
      if (!face.el) return;

      // 計算該面旋轉後的新法向量
      // 注意：我們傳入 -rotationX 和 -rotationY 是因為 CSS transform 的軸向與標準數學座標系有差異
      const currentNormal = rotateVector(
        face.x,
        face.y,
        face.z,
        rotationX,
        rotationY,
      );

      // 核心邏輯：計算亮度
      // 我們只關心 Y 軸 (Up/Down)。
      // 如果 Y = 1 (朝正上)，陰影應為 0 (最亮)
      // 如果 Y = -1 (朝正下)，陰影應為 0.8 (最暗，不要全黑保留細節)

      // 公式：將 -1~1 的 Y值 映射到 0.8~0 的 Opacity
      // NormalY:  1 (Top) -> Opacity 0
      // NormalY: -1 (Bottom) -> Opacity 0.8

      let intensity = currentNormal.y;

      // 映射公式
      // shade = (1 - intensity) * 0.4;  <-- 係數 0.4 代表最暗時遮罩濃度 80% (0.4*2) ?
      // 修正公式：讓朝上的面完全透明，朝下的面變黑
      // intensity 1 -> shade 0
      // intensity 0 -> shade 0.4
      // intensity -1 -> shade 0.8
      // 調亮40%：原本 0.45 * 0.6 = 0.27 (減少40%的陰影)
      // 溫和50%：0.27 * 0.5 = 0.135 (再減少50%的陰影，讓立體感更溫和)
      let shadeOpacity = (1 - intensity) * 0.135; // 溫和50%：從 0.27 減少到 0.135

      // 邊界檢查
      if (shadeOpacity < 0) shadeOpacity = 0;
      if (shadeOpacity > 0.9) shadeOpacity = 0.9;

      // 直接寫入 CSS 變數
      face.el.style.setProperty("--shade", shadeOpacity);
    });
  }

  // 我們需要一個物件來記錄當前的角度，以便讓 GSAP update 時讀取
  const cubeState = { rx: -20, ry: -20 }; // 初始角度

  // 初始化光影（使用初始角度）
  updateLighting(cubeState.rx, cubeState.ry);

  // 初始漂浮動畫 (讓它自己動一點點)
  // 修改為使用 cubeState 並同步更新光影
  let floatAnimation = gsap.to(cubeState, {
    rx: -20 + 10, // 初始角度 + 偏移
    duration: 3,
    yoyo: true,
    repeat: -1,
    ease: "sine.inOut",
    onUpdate: () => {
      cube.style.transform = `rotateX(${cubeState.rx}deg) rotateY(${cubeState.ry}deg) translateY(30px)`;
      updateLighting(cubeState.rx, cubeState.ry);
    },
  });

  // 滑鼠互動：優雅的慢速跟隨 + 動態光影
  sceneContainer.addEventListener("mousemove", (e) => {
    // 如果正在右鍵拖移或觸控拖移，不執行滑鼠跟隨
    if (isRightClickDragging || isTouchDragging) return;

    // 計算滑鼠在視窗中的相對位置 (-1 到 1)
    const xPos = (e.clientX / window.innerWidth) * 2 - 1;
    const yPos = (e.clientY / window.innerHeight) * 2 - 1;

    // 目標角度
    const targetRotY = xPos * 180;
    const targetRotX = -yPos * 180;

    gsap.to(cubeState, {
      rx: targetRotX,
      ry: targetRotY,
      duration: 3, // 旋轉更慢：從 2.5 秒改為 3 秒
      ease: "power2.out",
      overwrite: "auto",

      // 關鍵：在動畫更新的每一幀，同步更新 CSS 與 光影
      onUpdate: () => {
        // 1. 更新骰子旋轉
        cube.style.transform = `rotateX(${cubeState.rx}deg) rotateY(${cubeState.ry}deg)`;

        // 2. 更新光影計算
        updateLighting(cubeState.rx, cubeState.ry);
      },
    });
  });

  // --- 右鍵拖移控制骰子旋轉 ---
  let isRightClickDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartRotX = 0;
  let dragStartRotY = 0;
  const dragSensitivity = 1.5; // 拖移敏感度，數值越大旋轉越快（調整為 1.5，讓拖移更容易翻動一面）

  // 檢查滑鼠是否在骰子上
  function isMouseOverCube(mouseX, mouseY) {
    if (!cube) return false;
    const rect = cube.getBoundingClientRect();
    const padding = 20;
    return (
      mouseX >= rect.left - padding &&
      mouseX <= rect.right + padding &&
      mouseY >= rect.top - padding &&
      mouseY <= rect.bottom + padding
    );
  }

  // 右鍵按下
  sceneContainer.addEventListener("contextmenu", (e) => {
    // 檢查是否在骰子上
    if (isMouseOverCube(e.clientX, e.clientY)) {
      e.preventDefault(); // 阻止右鍵選單
      isRightClickDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartRotX = cubeState.rx;
      dragStartRotY = cubeState.ry;

      // 停止當前的 GSAP 動畫
      gsap.killTweensOf(cubeState);
    }
  });

  // 滑鼠移動（拖移時）
  let dragMoveHandler = (e) => {
    if (!isRightClickDragging) return;

    // 計算拖移距離
    const deltaX = e.clientX - dragStartX;
    const deltaY = e.clientY - dragStartY;

    // 根據拖移方向更新旋轉角度
    // 向右拖移 → 增加 rotateY（向右翻）
    // 向左拖移 → 減少 rotateY（向左翻）
    // 向上拖移 → 減少 rotateX（向上翻）
    // 向下拖移 → 增加 rotateX（向下翻）
    const newRotY = dragStartRotY + deltaX * dragSensitivity;
    const newRotX = dragStartRotX - deltaY * dragSensitivity; // 負號是因為向上拖移應該向上翻

    // 更新狀態
    cubeState.rx = newRotX;
    cubeState.ry = newRotY;

    // 立即更新骰子旋轉和光影
    cube.style.transform = `rotateX(${cubeState.rx}deg) rotateY(${cubeState.ry}deg)`;
    updateLighting(cubeState.rx, cubeState.ry);
  };

  // 滑鼠放開（結束拖移）
  let dragEndHandler = (e) => {
    // 只處理右鍵放開（button === 2 表示右鍵）
    if (isRightClickDragging && e.button === 2) {
      isRightClickDragging = false;
      e.preventDefault(); // 阻止右鍵選單
    }
  };

  // 監聽滑鼠移動和放開事件
  window.addEventListener("mousemove", dragMoveHandler, { passive: true });
  window.addEventListener("mouseup", dragEndHandler);
  // 也監聽右鍵放開（contextmenu 事件）
  window.addEventListener("contextmenu", (e) => {
    if (isRightClickDragging) {
      e.preventDefault();
      isRightClickDragging = false;
    }
  });

  // --- 手機版觸控事件：支援滑動翻轉骰子 ---
  let isTouchDragging = false;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartRotX = 0;
  let touchStartRotY = 0;
  let hasMoved = false; // 追蹤是否發生了拖移
  const touchDragSensitivity = 1.5; // 觸控拖移敏感度
  const touchMoveThreshold = 10; // 拖移閾值（像素），超過此值才視為拖移

  // 觸控開始
  sceneContainer.addEventListener(
    "touchstart",
    (e) => {
      if (!cube) return;
      const touch = e.touches[0];
      if (isMouseOverCube(touch.clientX, touch.clientY)) {
        e.preventDefault(); // 阻止預設行為（如滾動）
        isTouchDragging = true;
        hasMoved = false; // 重置移動標記
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartRotX = cubeState.rx;
        touchStartRotY = cubeState.ry;

        // 停止當前的 GSAP 動畫
        gsap.killTweensOf(cubeState);
      }
    },
    { passive: false },
  );

  // 觸控移動（拖移時）
  sceneContainer.addEventListener(
    "touchmove",
    (e) => {
      if (!isTouchDragging) return;
      e.preventDefault(); // 阻止滾動

      const touch = e.touches[0];
      // 計算拖移距離
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 如果移動距離超過閾值，標記為拖移
      if (moveDistance > touchMoveThreshold) {
        hasMoved = true;
      }

      // 根據拖移方向更新旋轉角度
      const newRotY = touchStartRotY + deltaX * touchDragSensitivity;
      const newRotX = touchStartRotX - deltaY * touchDragSensitivity;

      // 更新狀態
      cubeState.rx = newRotX;
      cubeState.ry = newRotY;

      // 立即更新骰子旋轉和光影
      cube.style.transform = `rotateX(${cubeState.rx}deg) rotateY(${cubeState.ry}deg)`;
      updateLighting(cubeState.rx, cubeState.ry);
    },
    { passive: false },
  );

  // 觸控結束
  sceneContainer.addEventListener(
    "touchend",
    (e) => {
      if (isTouchDragging) {
        const touch = e.changedTouches[0];

        // 如果沒有發生拖移（只是輕觸），觸發點擊事件
        if (
          !hasMoved &&
          cube &&
          isMouseOverCube(touch.clientX, touch.clientY)
        ) {
          // 延遲觸發點擊，確保觸控事件完全結束
          setTimeout(() => {
            const clickEvent = new MouseEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window,
            });
            cube.dispatchEvent(clickEvent);
          }, 50);
        }

        isTouchDragging = false;
        hasMoved = false;
        e.preventDefault();
      }
    },
    { passive: false },
  );

  // 觸控取消（如被系統中斷）
  sceneContainer.addEventListener(
    "touchcancel",
    (e) => {
      if (isTouchDragging) {
        isTouchDragging = false;
        hasMoved = false;
      }
    },
    { passive: false },
  );

  // 點擊骰子或周圍區域時，觸發新頁面動畫
  const detailView = document.getElementById("seal-carving-detail-view");
  const sealCarvingSection = document.getElementById("seal-carving-section");
  const cubeShadow = document.querySelector(".cube-shadow");

  if (cube && detailView && sealCarvingSection) {
    // 統一的點擊處理函數
    function triggerDetailView(e) {
      // 如果新頁面已經顯示，不重複觸發
      if (!detailView.classList.contains("hidden")) {
        return;
      }

      // 確保骰子容器是顯示的且可點擊
      if (sealCarvingSection.style.display === "none") {
        sealCarvingSection.style.display = "block";
      }
      sealCarvingSection.style.pointerEvents = "auto";
      cube.style.pointerEvents = "auto";
      cube.style.visibility = "visible";

      // 停止所有骰子動畫
      gsap.killTweensOf(cubeState);
      gsap.killTweensOf(cube);
      if (cubeShadow) {
        gsap.killTweensOf(cubeShadow);
      }
      if (floatAnimation) {
        floatAnimation.kill();
      }

      // 創建動畫時間軸
      const tl = gsap.timeline();

      // 1. 骰子縮小動畫（保持立方體形狀，只縮放）
      // 保存當前旋轉狀態
      const currentRotX = cubeState.rx;
      const currentRotY = cubeState.ry;

      // 使用 GSAP 的 scale，並在動畫過程中保持旋轉和位移
      tl.to(cube, {
        scale: 0,
        duration: 1.8,
        ease: "power2.inOut",
        transformOrigin: "center center",
        onUpdate: () => {
          // 在動畫過程中保持旋轉和位移
          const currentScale = gsap.getProperty(cube, "scale");
          cube.style.transform = `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) translateY(30px) scale(${currentScale})`;
          updateLighting(currentRotX, currentRotY);
        },
      })
        .to(
          cubeShadow || ".cube-shadow",
          {
            opacity: 0,
            scale: 0,
            duration: 1.5,
            ease: "power2.inOut",
          },
          "-=1.2",
        )
        // 2. 隱藏骰子容器
        .set(sealCarvingSection, {
          display: "none",
          pointerEvents: "none",
        })
        // 3. 移除 hidden class（必須在設置 display 之前）
        .call(() => {
          detailView.classList.remove("hidden");
        })
        // 4. 設置新頁面初始狀態並顯示
        .set(detailView, {
          display: "flex",
          x: "100%",
          opacity: 0,
        })
        // 5. 從右邊滑入
        .to(
          detailView,
          {
            x: "0%",
            opacity: 1,
            duration: 1.5,
            ease: "power3.out",
          },
          "-=0.3",
        );
    }

    // 返回骰子頁面的函數
    function returnToCube() {
      // 如果新頁面已經隱藏，不重複觸發
      if (detailView.classList.contains("hidden")) {
        return;
      }

      // 創建動畫時間軸
      const tl = gsap.timeline({
        onComplete: () => {
          // 恢復骰子初始狀態
          cubeState.rx = -20;
          cubeState.ry = -20;

          // 確保骰子容器可見且可點擊
          sealCarvingSection.style.display = "block";
          sealCarvingSection.style.visibility = "visible";
          sealCarvingSection.style.pointerEvents = "auto";
          sealCarvingSection.style.opacity = "1";

          // 確保骰子的 scale 和 transform 正確設置
          gsap.set(cube, {
            scale: 1,
            clearProps: "transform",
            visibility: "visible",
            opacity: 1,
          });

          // 設置初始 transform（包含旋轉和位移）
          cube.style.transform = `rotateX(${cubeState.rx}deg) rotateY(${cubeState.ry}deg) translateY(30px)`;
          cube.style.pointerEvents = "auto";
          cube.style.visibility = "visible";
          cube.style.opacity = "1";
          updateLighting(cubeState.rx, cubeState.ry);

          // 恢復陰影
          if (cubeShadow) {
            gsap.set(cubeShadow, {
              opacity: 0.5,
              scale: 1,
              visibility: "visible",
            });
          }

          // 重新啟動漂浮動畫
          floatAnimation = gsap.to(cubeState, {
            rx: -20 + 10,
            duration: 3,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            onUpdate: () => {
              cube.style.transform = `rotateX(${cubeState.rx}deg) rotateY(${cubeState.ry}deg) translateY(30px)`;
              updateLighting(cubeState.rx, cubeState.ry);
            },
          });

          // 確保新頁面已隱藏
          detailView.classList.add("hidden");
          detailView.style.display = "none";
        },
      });

      // 1. 新頁面滑出（向右滑出）
      tl.to(detailView, {
        x: "100%",
        opacity: 0,
        duration: 1.5,
        ease: "power3.in",
      })
        // 2. 隱藏新頁面
        .set(detailView, {
          display: "none",
        })
        .set(() => {
          // 添加 hidden class，確保狀態正確
          detailView.classList.add("hidden");
        })
        // 3. 顯示骰子容器
        .set(sealCarvingSection, {
          display: "block",
          pointerEvents: "auto",
          visibility: "visible",
          opacity: "1",
        })
        // 4. 設置骰子初始狀態（縮小狀態）
        .set(() => {
          cubeState.rx = -20;
          cubeState.ry = -20;
          // 先清除所有 transform，然後設置初始狀態
          gsap.set(cube, {
            scale: 0,
            clearProps: "transform",
            visibility: "visible",
            opacity: 1,
          });
          // 設置初始 transform（包含旋轉和位移，但 scale 為 0）
          cube.style.transform = `rotateX(${cubeState.rx}deg) rotateY(${cubeState.ry}deg) translateY(30px) scale(0)`;
          cube.style.pointerEvents = "auto";
          cube.style.visibility = "visible";
          cube.style.opacity = "1";
          updateLighting(cubeState.rx, cubeState.ry);
        })
        // 5. 骰子出現動畫（保持立方體形狀，只放大）
        .to(
          cube,
          {
            scale: 1,
            duration: 1.8,
            ease: "power2.out",
            transformOrigin: "center center",
            onUpdate: () => {
              // 在動畫過程中保持旋轉和位移
              const currentScale = gsap.getProperty(cube, "scale");
              cube.style.transform = `rotateX(${cubeState.rx}deg) rotateY(${cubeState.ry}deg) translateY(30px) scale(${currentScale})`;
              updateLighting(cubeState.rx, cubeState.ry);
            },
          },
          "-=0.3",
        )
        .fromTo(
          cubeShadow || ".cube-shadow",
          {
            opacity: 0,
            scale: 0,
          },
          {
            opacity: 0.5,
            scale: 1,
            duration: 1.5,
            ease: "power2.out",
          },
          "-=1.2",
        );

      // 添加 hidden class
      detailView.classList.add("hidden");
    }

    // 點擊骰子本身（包括所有面）
    cube.addEventListener("click", (e) => {
      e.stopPropagation();
      triggerDetailView(e);
    });

    // 點擊骰子容器周圍區域
    sceneContainer.addEventListener("click", (e) => {
      // 如果點擊的是骰子本身，不重複觸發（已經在上面處理）
      if (e.target.closest("#cube")) {
        return;
      }

      // 點擊容器區域時觸發
      triggerDetailView(e);
    });

    // 在新頁面上添加點擊事件，返回骰子頁面
    if (detailView) {
      // 添加 clickable class，讓滑鼠 hover 時變成大圓形
      detailView.classList.add("clickable");

      detailView.addEventListener("click", (e) => {
        // 點擊新頁面時返回骰子
        returnToCube();
      });
    }
  }
}

// 在 DOM 載入時初始化篆刻頁面（如果頁面已存在）
document.addEventListener("DOMContentLoaded", function () {
  // 延遲初始化，確保所有元素都已載入
  setTimeout(() => {
    const sealCarvingPage = document.getElementById("sealcarving");
    if (sealCarvingPage && sealCarvingPage.classList.contains("active")) {
      initSealCarvingDice();
    }
  }, 200);
});
