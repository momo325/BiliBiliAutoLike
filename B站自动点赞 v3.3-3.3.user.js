// ==UserScript==
// @name         B站自动点赞 v3.3
// @namespace    zakee-bilibili-autolike
// @version      3.3
// @description  自动在真实观看达70%后点赞；短视频兼容；忽略快进；不会误取消手动点赞；支持倍速和分P切换
// @author       zakee
// @match        https://www.bilibili.com/video/*
// @grant        none
// @homepage     https://github.com/momo325/BiliBiliAutoLike
// @license MIT
// @downloadURL https://update.greasyfork.org/scripts/551849/B%E7%AB%99%E8%87%AA%E5%8A%A8%E7%82%B9%E8%B5%9E%20v33.user.js
// @updateURL https://update.greasyfork.org/scripts/551849/B%E7%AB%99%E8%87%AA%E5%8A%A8%E7%82%B9%E8%B5%9E%20v33.meta.js
// ==/UserScript==

/*
GitHub: https://github.com/momo325/BiliBiliAutoLike
*/

(function () {
    'use strict';

    let currentVideo = null;
    let currentDuration = 0;
    let liked = false;
    let lastTime = 0;
    let monitorTimer = null;

    const WATCH_RATIO = 0.7;  // 70%观看比例
    const DELTA_LIMIT = 5;    // 快进判定阈值

    console.log('🎬 B站自动点赞 v3.3 回溯版已启动 (delta=5)');

    // 监听 video 元素变化（分P切换）
    const observer = new MutationObserver(() => {
        const video = document.querySelector('video');
        if (video) {
            if (video !== currentVideo) {
                switchToNewVideo(video);
            } else if (video.duration !== currentDuration && !isNaN(video.duration) && video.duration > 0) {
                switchToNewVideo(video);
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function switchToNewVideo(video) {
        currentVideo = video;
        currentDuration = video.duration || 0;
        liked = false;
        lastTime = video.currentTime;
        if (monitorTimer) clearInterval(monitorTimer);
        startMonitor(video);
    }

    function startMonitor(video) {
        monitorTimer = setInterval(() => {
            if (!video || isNaN(video.duration) || video.duration === 0) return;

            const current = video.currentTime;
            let delta = current - lastTime;
            lastTime = current;

            // 快进/跳帧判定
            if (delta > DELTA_LIMIT || delta < 0) return;

            const ratio = video.currentTime / video.duration;

            if (!liked && ratio >= WATCH_RATIO) {
                liked = true;
                if (!isLiked()) {
                    triggerLikeByQ();
                    console.log(`👍 已自动点赞（播放比例 ${(ratio * 100).toFixed(1)}%）`);
                } else {
                    console.log('💡 用户已手动点赞，跳过自动点赞');
                }
            }
        }, 1000);
    }

    function isLiked() {
        const btn = document.querySelector('.video-like, .like, .toolbar-left .like');
        return btn && (
            btn.getAttribute('aria-pressed') === 'true' ||
            btn.classList.contains('on') ||
            btn.classList.contains('active')
        );
    }

    function triggerLikeByQ() {
        const keyDown = new KeyboardEvent('keydown', {
            key: 'q',
            code: 'KeyQ',
            keyCode: 81,
            bubbles: true,
            cancelable: true
        });
        const keyUp = new KeyboardEvent('keyup', {
            key: 'q',
            code: 'KeyQ',
            keyCode: 81,
            bubbles: true,
            cancelable: true
        });

        document.dispatchEvent(keyDown);
        setTimeout(() => document.dispatchEvent(keyUp), 50);
    }

})();
