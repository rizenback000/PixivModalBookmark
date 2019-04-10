// ==UserScript==
// @name         PixvModalBookmark
// @namespace    http://unote.hatenablog.com/
// @version      2.0.4
// @description  Pixivのブックマークをモーダル表示させる
// @author       rizenback000
// @match        https://www.pixiv.net/member_illust.php?*illust_id=*
// @remark       https://code.jquery.com/jquery-3.3.1.slim.min.js //使わないことにした
// @grant        none
// ==/UserScript==

// 更新履歴
// 1.0.0　Pixvが密かに用意していたモーダルフォームを利用するバージョン
// 1.3.0　jQuery使わないバージョン
// 2.0.0  iframeを使ったバージョン
// 2.0.1　仕様変更に対応
// 2.0.2　バグ対応(確実に読み込めなかった)
// 2.0.4  Pixiv側のonclickにイベントを取られてる可能性があったのでonclick追加
(function () {
  'use strict';
  const modal = document.createElement('div');
  const iframe = document.createElement('iframe');

  const winLoad = () => {
    console.log('load');
    // 画像部分の読み込みは後から読み込まれるので、
    // まずg[mask]が読み込まれるのを確認する
    const target = document.querySelector('body');
    const observer = new MutationObserver(() => {
      const g = document.querySelector('g[mask]');
      if (g !== null) {
        // 最初だけ追加
        if (modal.id === '') {
          modal.id = 'modalContainer';
          modal.style.position = "fixed";
          modal.style.display = "none";
          modal.style.width = "100%";
          modal.style.height = "100%";
          modal.style.top = "0";
          modal.style.left = "0";
          modal.style.padding = 'auto auto';
          modal.style.backgroundColor = "rgba(0,0,0,0.5)";
          modal.style.zIndex = "2";
          modal.style.cursor = "pointer";
          document.body.appendChild(modal);

          iframe.id = 'modalIframe';
          iframe.style.width = '50%';
          iframe.style.height = '50%';
          iframe.style.margin = 'auto';
          iframe.style.top = "0";
          iframe.style.left = "0";
          iframe.style.right = "0";
          iframe.style.bottom = "0";
          iframe.style.position = "absolute";

          iframe.onload = () => {
            const ifcont = iframe.contentDocument;
            if (ifcont.URL == "about:blank") return 1;
            const header = ifcont.querySelector('header');
            const toolmenu = ifcont.querySelector('._toolmenu');
            const footer = ifcont.querySelector('footer');
            //const feedback = ifcont.querySelector('#toolbar-items');
            const thumb = ifcont.querySelector('.thumbnail-container');
            //feedback.parentNode.removeChild(feedback);
            header.parentNode.removeChild(header);
            toolmenu.parentNode.removeChild(toolmenu);
            footer.parentNode.removeChild(footer);
            thumb.parentNode.removeChild(thumb);
            const bmDetail = ifcont.querySelector('section.bookmark-detail-unit');
            bmDetail.style.padding = "0px 5px";
            const exTags = ifcont.querySelector('._unit._list-unit.bookmark-list-unit');
            exTags.style.padding = "0px 5px";
            const inputBoxes = ifcont.querySelectorAll('div.input-box');
            Array.from(inputBoxes, elm => elm.style.marginLeft = "0");
            const userIcon = ifcont.querySelector('div._user-icon');
            userIcon.style.top = "0";
            userIcon.style.left = "0";
            const wrapper = ifcont.querySelector('#wrapper');
            wrapper.style.width = 'auto';
            wrapper.style.marginTop = '0';
            const lbody = ifcont.querySelector('.layout-body');
            lbody.style.marginTop = '0';
            lbody.style.width = 'auto';
            const form = ifcont.querySelector('form');
            form.style.paddingTop = '10';
          };
          modal.appendChild(iframe);
        }

        // イベントの追加
        overrideFavEvent();
        // 作品一覧から別作品へ飛ぶと画像部分だけの読み込みになるのでここでキャッチ
        const target2 = document.querySelector('#root div[role] a');
        const observer2 = new MutationObserver(overrideFavEvent);
        observer2.observe(target2, {
          attributes: true,
          attributeFilter: ['href']
        });
        observer.disconnect();
      }
    });
    observer.observe(target, {
      childList: true,
      subtree: true,
    });
  };
  window.removeEventListener('load', winLoad);
  window.addEventListener('load', winLoad);




  function overrideFavEvent() {
    const favIcon = document.querySelector('g[mask]').parentNode.parentNode;
    console.log(favIcon);


    const getContentsUrl = ()=> {
      const contentsId = document.querySelector('a[title=ブックマーク]').href.match(/\d+/)[0];
      return "https://www.pixiv.net/bookmark_add.php?type=illust&illust_id=" + contentsId;
    };

    const getTimeoutId = () => {return favIcon.getAttribute('timeoutId');}

    const modalClick = () => {
      modal.style.display = 'none'
    };
    modal.removeEventListener('click', modalClick);
    modal.addEventListener('click', modalClick);

    // モーダルiframe表示
    const favClick = e => {
      e.preventDefault();
      e.stopPropagation();
      modal.style.display = 'block';
      const preloadFlg = favIcon.getAttribute('preload');
      console.log(preloadFlg);
      if (preloadFlg !== 'preload'){
        iframe.src = getContentsUrl();
      }
      favIcon.removeAttribute('preload');
      return 0;
    };
    favIcon.removeEventListener('click', favClick);
    favIcon.addEventListener('click', favClick);
    favIcon.onclick = favClick;

    // iframeプリロード
    const favEnter = e => {
      const timeoutId = setTimeout((e) => {
        favIcon.setAttribute('preload', 'preload');
        iframe.src = getContentsUrl();
      }, 500);
      favIcon.setAttribute('timeoutId', timeoutId);
    };
    favIcon.removeEventListener('mouseenter', favEnter);
    favIcon.addEventListener('mouseenter', favEnter);


    // すぐにマウスが離れたらプリロードさせない
    const favLeave = e => {
      console.log('leave');
      clearTimeout(getTimeoutId());
    };
    favIcon.removeEventListener('mouseleave', favLeave);
    favIcon.addEventListener('mouseleave', favLeave);
  }

})();
