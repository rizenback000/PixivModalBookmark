// ==UserScript==
// @name         PixvModalBookmark
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  Pixivのブックマークをモーダル表示させる
// @author       rizenback000
// @match        https://www.pixiv.net/member_illust.php?*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  function overrideFavEvent() {
    const favIcon = document.querySelector('g[mask]').parentNode.parentNode;
    const modal = document.createElement('div');
    modal.style.position = "fixed";
    modal.style.display = "none";
    modal.style.width = "100%";
    modal.style.height = "120%";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.padding = 'auto auto';
    modal.style.backgroundColor = "rgba(0,0,0,0.5)";
    modal.style.zIndex = "2";
    modal.style.cursor = "pointer";
    document.body.appendChild(modal);
    const iframe = document.createElement('iframe');
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
      const feedback = ifcont.querySelector('#toolbar-items');
      const thumb = ifcont.querySelector('.thumbnail-container');
      feedback.parentNode.removeChild(feedback);
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
    modal.addEventListener('click', () => modal.style.display = 'none');

    // モーダルiframe表示
    favIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      modal.style.display = 'block';
    });

    // iframeプリロード
    favIcon.addEventListener('mouseover', (e) => {
      const flg = favIcon.getAttribute('mouseover');
      if (flg === null) {
        favIcon.setAttribute('mouseover', '1');
        const contentsId = document.querySelector('a[title=ブックマーク]').href.match(/\d+/)[0];
        iframe.src = "https://www.pixiv.net/bookmark_add.php?type=illust&illust_id=" + contentsId;
      }
    });
  }

  window.addEventListener('load', () => {
    const target = document.querySelector('#root div[role] img').parentNode;
    const config = {
      attributes: true
    };
    console.log(target);
    const observer = new MutationObserver(overrideFavEvent);
    observer.observe(target, config);
    overrideFavEvent();
  });


})();
