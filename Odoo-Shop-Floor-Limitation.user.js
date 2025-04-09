// ==UserScript==
// @name            Odoo Shop Floor Limitation
// @name:tr         Odoo İmalat Ekranı Sınırlandırma
// @namespace       https://github.com/sipsak
// @version         1.0
// @description     Removes the filter bar and the work center add button on the Odoo Shop Floor, changes the Close button's function to Full Screen, and automatically clicks the Refresh button at a specified interval.
// @description:tr  Odoo İmalat Ekranında filtre çubuğunu ve iş merkezi ekleme butonunu kaldırır, Kapat butonunun işlevini Tam Ekran olarak değiştirir ve belirlenen sürede bir otomatik olarak Yenile butonuna tıklar.
// @author          Burak Şipşak
// @match           https://portal.bskhvac.com.tr/*
// @match           https://*.odoo.com/*
// @grant           none
// @icon            https://raw.githubusercontent.com/sipsak/odoo-image-enlarger/refs/heads/main/icon.png
// @updateURL       https://raw.githubusercontent.com/sipsak/Odoo-Shop-Floor-Limitation/main/Odoo-Shop-Floor-Limitation.user.js
// @downloadURL     https://raw.githubusercontent.com/sipsak/Odoo-Shop-Floor-Limitation/main/Odoo-Shop-Floor-Limitation.user.js
// ==/UserScript==

(function() {
    'use strict';

    function shouldClickRefreshButton() {
        // Tüm sayfadaki metinlerde "Üretim Kapat" veya "Close Production" ifadelerini kontrol et
        const pageText = document.body.innerText;

        // İfadeler hiç geçmiyorsa, tıklama yap
        if (!pageText.includes('Üretim Kapat') && !pageText.includes('Close Production')) {
            return true;
        }

        // Tüm butonları bul
        const buttons = document.querySelectorAll('button.btn-primary, button.btn-secondary');

        // Her buton için kontrol yap
        for (let button of buttons) {
            const buttonText = button.textContent.trim();

            // Eğer "Üretim Kapat" veya "Close Production" btn-secondary içindeyse tıklama yap
            if (button.classList.contains('btn-secondary') &&
                (buttonText === 'Üretim Kapat' || buttonText === 'Close Production')) {
                return true;
            }

            // Eğer "Üretim Kapat" veya "Close Production" btn-primary içindeyse tıklama yapma
            if (button.classList.contains('btn-primary') &&
                (buttonText === 'Üretim Kapat' || buttonText === 'Close Production')) {
                return false;
            }
        }

        // Yukarıdaki koşulların hiçbiri sağlanmazsa tıklama yap
        return true;
    }

    function applyChanges() {
        // Eğer action=621 içermeyen bir sayfadaysak çık
        if (!window.location.href.includes("action=621")) {
            return;
        }

        // Filtre çubuğunu kaldır
        let filterBar = document.querySelector('.o_cp_searchview');
        if (filterBar) {
            filterBar.remove();
            console.log("Filtre çubuğu kaldırıldı.");
        }

        // Artı butonunu kaldır
        let addButton = document.querySelector('.position-sticky .fa-plus');
        if (addButton) {
            addButton.remove();
            console.log("Artı butonu kaldırıldı.");
        }

        // Yenile butonuna belirli aralıklarla tıkla, ama "Üretim Kapat" veya "Close Production" butonunu kontrol et
        let refreshButton = document.querySelector('button.fa-refresh');
        if (refreshButton && !refreshButton.dataset.autoClick) {
            refreshButton.dataset.autoClick = "true";
            setInterval(() => {
                // Tıklama yapılıp yapılmayacağını kontrol et
                if (shouldClickRefreshButton()) {
                    refreshButton.click();
                    console.log("Yenile butonuna otomatik tıklama yapıldı.");
                } else {
                    console.log("Üretim Kapat/Close Production butonu mevcut olduğundan yenileme atlandı.");
                }
            }, 4000); // milisaniyede bir yenile butonuna otomatik tıklar
        }

        // Kapat butonunu "Tam Ekran" butonuna dönüştür
        let closeButton = document.querySelector('.o_home_menu');
        if (closeButton && !closeButton.dataset.modified) {
            closeButton.dataset.modified = "true";

            // Mevcut tıklama eventlerini temizle
            let newButton = closeButton.cloneNode(true);
            closeButton.parentNode.replaceChild(newButton, closeButton);
            closeButton = newButton;

            let span = closeButton.querySelector('span');
            if (!span) {
                span = document.createElement('span');
                closeButton.appendChild(span);
            }
            span.textContent = "Tam Ekran";
            span.classList.add("ms-1"); // Simge ile metin arasına boşluk ekler

            let icon = closeButton.querySelector('i');
            if (!icon) {
                icon = document.createElement('i');
                closeButton.prepend(icon);
            }
            icon.className = "fa fa-expand me-1"; // Başlangıçta büyütme simgesi ve boşluk ekler

            closeButton.addEventListener('click', function(e) {
                e.preventDefault(); // Sayfa yönlendirmesini tamamen iptal et
                console.log("Tam Ekran butonuna tıklandı.");

                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().then(() => {
                        console.log("Tam ekran modu açıldı.");
                        icon.className = "fa fa-compress me-1"; // Küçültme simgesi
                    }).catch(err => {
                        console.error("Tam ekran modu açılamadı:", err);
                    });
                } else {
                    document.exitFullscreen().then(() => {
                        console.log("Tam ekran modu kapatıldı.");
                        icon.className = "fa fa-expand me-1"; // Büyütme simgesi
                    }).catch(err => {
                        console.error("Tam ekran modundan çıkılamadı:", err);
                    });
                }
            });
        }
    }

    // Sayfa yüklendiğinde değişiklikleri uygula
    applyChanges();

    // MutationObserver ile sayfa değişimlerini sürekli izle
    let observer = new MutationObserver(() => {
        applyChanges();
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();