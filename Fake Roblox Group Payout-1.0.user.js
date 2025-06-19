// ==UserScript==
// @name         Fake Roblox Group Payout
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Fake Roblox group payout interface for demonstration
// @author       You
// @match        https://create.roblox.com/dashboard/group/payouts*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let fakeGroupFunds = 1000000; // Change group funds
  let groupFundsElement = null; // Store reference to the element

  function formatNumber(num) {
    return num.toLocaleString();
  }

  function showSuccessNotification() {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #00A86B;
            color: black;
            padding: 16px 32px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 400;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            font-family: 'Builder Sans', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            min-width: 280px;
            white-space: nowrap;
        `;

    // Create checkmark icon with green background and thick black border
    const checkmarkContainer = document.createElement("div");
    checkmarkContainer.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: #00A86B;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            flex-shrink: 0;
            border: 3px solid black;
        `;

    // Create SVG checkmark
    const checkmarkSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    );
    checkmarkSvg.setAttribute("width", "10");
    checkmarkSvg.setAttribute("height", "10");
    checkmarkSvg.setAttribute("viewBox", "0 0 24 24");
    checkmarkSvg.setAttribute("fill", "none");
    checkmarkSvg.style.cssText = `
            display: block;
        `;

    const checkmarkPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    checkmarkPath.setAttribute(
      "d",
      "M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
    );
    checkmarkPath.setAttribute("fill", "black");

    checkmarkSvg.appendChild(checkmarkPath);
    checkmarkContainer.appendChild(checkmarkSvg);
    notification.appendChild(checkmarkContainer);

    const textSpan = document.createElement("span");
    textSpan.textContent = "The payout has been sent";
    textSpan.style.cssText = `
            color: black;
            font-family: 'Builder Sans', 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-weight: 400;
        `;
    notification.appendChild(textSpan);

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  function addStyles() {
    if (!document.querySelector("#fake-payout-styles")) {
      const style = document.createElement("style");
      style.id = "fake-payout-styles";
      style.textContent = `
                @import url('https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;500;600;700&display=swap');

                .fake-hidden-error {
                    display: none !important;
                }
                .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline {
                    border-color: #494d5a !important;
                }
                .fake-robux-amount {
                    letter-spacing: 2px !important;
                    font-variant-numeric: tabular-nums !important;
                }
                /* Force label to not be red */
                #payout-amount-label.Mui-error,
                label[for="payout-amount"].Mui-error {
                    color: rgba(255, 255, 255, 0.7) !important;
                }
            `;
      document.head.appendChild(style);
    }
  }

  function updateGroupFunds() {
    const fakeAmount = formatNumber(fakeGroupFunds);
    console.log("=== DEBUGGING GROUP FUNDS UPDATE ===");
    console.log("Target amount to display:", fakeAmount);
    console.log("Current fakeGroupFunds variable:", fakeGroupFunds);

    // Method 1: Look for injpog spans specifically
    const injpogSpans = document.querySelectorAll('span[class*="injpog"]');
    console.log('Found', injpogSpans.length, 'spans with "injpog" in class');
    injpogSpans.forEach((span, index) => {
      console.log(
        `  injpog span ${index}: "${span.textContent}" | class: ${span.className}`
      );
      const oldText = span.textContent;
      span.textContent = fakeAmount;
      console.log(
        `  Updated span ${index} from "${oldText}" to "${fakeAmount}"`
      );
    });

    // Method 2: Look for ANY spans with large numbers
    const allSpans = document.querySelectorAll("span");
    console.log("Checking all", allSpans.length, "spans for large numbers...");

    let foundLargeNumbers = [];
    allSpans.forEach((span, index) => {
      const text = span.textContent.trim();
      const cleanNum = parseInt(text.replace(/[,\s]/g, ""));

      if (cleanNum > 100000000) {
        foundLargeNumbers.push({
          index: index,
          text: text,
          cleanNum: cleanNum,
          className: span.className,
        });
      }
    });

    console.log("Found", foundLargeNumbers.length, "spans with large numbers:");
    foundLargeNumbers.forEach((item) => {
      console.log(
        `  Span ${item.index}: "${item.text}" (${item.cleanNum}) | class: ${item.className}`
      );
    });

    // Update all large number spans
    foundLargeNumbers.forEach((item) => {
      const span = allSpans[item.index];
      span.textContent = fakeAmount;
      console.log(`  FORCED UPDATE span ${item.index} to: ${fakeAmount}`);
    });

    console.log("=== END DEBUGGING ===");
  }

  function processModal() {
    const modal = document.querySelector('[role="dialog"]');
    if (!modal || !modal.textContent.includes("Send to Creators")) return;

    // Hide error message
    const errorAlert = modal.querySelector(".MuiAlert-filledError");
    if (errorAlert) {
      errorAlert.classList.add("fake-hidden-error");
    }

    // Fix input styling
    const amountInput = modal.querySelector("#payout-amount");
    if (amountInput) {
      amountInput.setAttribute("aria-invalid", "false");

      const container = amountInput.closest(".MuiOutlinedInput-root");
      if (container) {
        container.classList.remove("Mui-error");
      }

      // Enable Next button
      const nextBtn = modal.querySelector("button[disabled]");
      if (nextBtn && nextBtn.textContent.includes("Next")) {
        nextBtn.disabled = false;
        nextBtn.removeAttribute("disabled");
        nextBtn.classList.remove("Mui-disabled");
        nextBtn.style.opacity = "1";
        nextBtn.style.backgroundColor = "white";
        nextBtn.style.color = "black";
        nextBtn.style.border = "1px solid #ccc";

        // Hijack click
        if (!nextBtn.dataset.hijacked) {
          nextBtn.dataset.hijacked = "true";

          nextBtn.addEventListener("click", function (e) {
            let amount = parseInt(amountInput.value) || 0;
            if (amount > 0) {
              e.preventDefault();
              e.stopPropagation();

              // Round to nearest thousand for easy calculation
              amount = Math.round(amount / 1000) * 1000;

              console.log(
                "Processing payout of",
                amount,
                "(rounded to nearest thousand)"
              );
              fakeGroupFunds -= amount;
              console.log("New fake group funds:", fakeGroupFunds);
              console.log(
                "Expected display amount:",
                formatNumber(fakeGroupFunds)
              );

              // Close modal like Cancel button
              const cancelButton = modal.querySelector("button");
              if (cancelButton && cancelButton.textContent.includes("Cancel")) {
                console.log("Clicking Cancel button to close modal properly");
                cancelButton.click();
              } else {
                // Fallback: click backdrop
                const backdrop = document.querySelector(".MuiBackdrop-root");
                if (backdrop) {
                  console.log("Clicking backdrop to close modal");
                  backdrop.click();
                } else {
                  // Last resort: hide modal
                  modal.style.display = "none";
                }
              }

              showSuccessNotification();

              // AGGRESSIVE multi-attempt updating
              setTimeout(() => {
                console.log("=== STARTING AGGRESSIVE UPDATE SEQUENCE ===");
                updateGroupFunds();
                setTimeout(() => {
                  console.log("=== UPDATE ATTEMPT 2 ===");
                  updateGroupFunds();
                }, 100);
                setTimeout(() => {
                  console.log("=== UPDATE ATTEMPT 3 ===");
                  updateGroupFunds();
                }, 500);
                setTimeout(() => {
                  console.log("=== UPDATE ATTEMPT 4 ===");
                  updateGroupFunds();
                }, 1000);
                setTimeout(() => {
                  console.log("=== FINAL UPDATE ATTEMPT ===");
                  updateGroupFunds();
                }, 2000);
              }, 500);
            }
          });
        }
      }
    }
  }

  function init() {
    addStyles();

    // Simple observer - only update when DOM changes
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        processModal();
        setTimeout(updateGroupFunds, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial calls only - no intervals
    setTimeout(updateGroupFunds, 2000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    setTimeout(init, 1000);
  }
})();
