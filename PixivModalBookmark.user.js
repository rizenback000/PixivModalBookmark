// ==UserScript==
// @name        PixivModalBookmark
// @namespace   unote.hatenablog.com
// @include     https://www.pixiv.net/member_illust.php?mode=medium&illust_id=*
// @version     1.3.1
// @grant       none
// ==/UserScript==

/*
The MIT License (MIT)

Copyright (c) 2015 bpyamasinn.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function() {
  /**
   * Pixivがデフォルトで持っているものを管理しようとしたクラス
   */
  class PixivOfficial {

    /**
     * BOOKMARK_TEXT - ブックマークボタンのテキスト
     *
     * @return {string}  description
     */
    static get CONSTANTS() {
      return {
        BOOKMARK_TEXT: {
          ADD: 'ブックマークに追加',
          EDIT: 'ブックマークを編集',
          DEL: 'ブックマーク解除',
        },
      };
    }


    /**
     * constructor - コンストラクタ
     *
     * @return {void}  description
     */
    constructor() {
      console.log('initialize PixivOfficial start');
      const commentForm = document.getElementsByClassName('_comment-form')[0];
      const bookmarkButton = document.getElementsByClassName('_bookmark-toggle-button')[0];
      const bookmarkButtonDescription = bookmarkButton.getElementsByClassName('description')[0];
      const niceButton = document.getElementsByClassName('_nice-button js-nice-button')[0];
      const modalBookmark = document.getElementsByClassName('bookmark-add-modal')[0];

      this.pixivOfficial = {
        bookmarkButton_: bookmarkButton,
        bookmarkButtonDescription_: bookmarkButtonDescription,
        niceButton_: niceButton,
        modalBookmark_: modalBookmark,
      };

      this.pixivOfficial.eigenValues = {
        // pixiv.～はpixiv公式のグローバル変数(?)
        artType_: pixiv.context.type,
        token_: commentForm.querySelector('input[name=tt]').value,
        userId_: pixiv.user.id,
        contentId_: null,
      };

      const ev = this.pixivOfficial.eigenValues;
      if (ev.artType_ === 'illust') {
        ev.contentId_ = commentForm.querySelector('input[name=illust_id]').value;
      } else {
        ev.contentId_ = commentForm.querySelector('input[name=id]').value;
      }
      console.log('initialize PixivOfficial end');
    }


    /**
     * get bookmarkButtonText - ブックマークボタンのテキストを取得
     *
     * @return {string}  ブックマークボタンのテキスト
     */
    get bookmarkButtonText() {
      return this.pixivOfficial.bookmarkButtonDescription_.textContent;
    }

    /**
     * set bookmarkButtonText - ブックマークボタンのテキストを設定
     *
     * @param {string} text 設定するブックマークボタンのテキスト
     * @return {void}
     */
    set bookmarkButtonText(text) {
      this.pixivOfficial.bookmarkButtonDescription_.textContent = text;
    }


    /**
     * getModalBookmark - モーダルブックマークのDOMElementを取得
     *
     * @return {Element}  モーダルブックマークのDOMElement
     */
    getModalBookmark() {
      return this.pixivOfficial.modalBookmark_;
    }

    /**
     * getBookmarkButton - ブックマーク追加ボタンのDOMElementを取得
     *
     * @return {Element}  ブックマーク追加ボタンのDOMElement
     */
    getBookmarkButton() {
      return this.pixivOfficial.bookmarkButton_;
    }


    /**
     * getNiceButton - いいねボタンのDOMElementを取得
     *
     * @return {Element}  いいねボタンのDOMElement
     */
    getNiceButton() {
      return this.pixivOfficial.niceButton_;
    }

    /**
     * getArtType - コンテンツの種類(illust,novel)など
     *
     * @return {string}  コンテンツの種類(illust,novel)など
     */
    getArtType() {
      return this.pixivOfficial.eigenValues.artType_;
    }

    /**
     * getContentId - コンテンツIDの取得
     *
     * @return {string}  コンテンツID
     */
    getContentId() {
      return this.pixivOfficial.eigenValues.contentId_;
    }

    /**
     * getToken - トークンの取得
     *
     * @return {string}  トークン番号
     */
    getToken() {
      return this.pixivOfficial.eigenValues.token_;
    }

    /**
     * getUserId - ユーザーIDの取得
     *
     * @return {string}  ユーザーID
     */
    getUserId() {
      return this.pixivOfficial.eigenValues.userId_;
    }

    /**
     * isRated - いいね済みかどうかを返す
     *
     * @return {boolean}  description
     */
    isRated() {
      return document.getElementsByClassName('score')[0].querySelector('.rated') !== null;
    }

  }


  /**
   * モーダルブックマークを流用して使えるようにする
   */
  class ModalBookmark extends PixivOfficial {
    /**
     * constructor - コンストラクタ
     *
     * @param  {Element} showBtnParent
     * モーダルブックマークボタンを設置する親のDOM Element
     * @return {void}                         description
     */
    constructor(showBtnParent) {
      console.log('initialize Modalbookamrk start');
      super();
      const self = this;

      const recommendButton = document.createElement('div');
      recommendButton.style =
        'width:100%; background-color:#ffffff; cursor:pointer; text-align:center;';
      recommendButton.textContent =
        '▼この作品をブックマークした人はこんな作品もブックマークしています▼';

      const recommendIFrame = document.createElement('iframe');
      recommendIFrame.style.display = 'none';
      recommendIFrame.src = 'bookmark_detail.php?illust_id=' + self.getContentId();

      const showButton = document.createElement('div');
      showButton.classList.add('_bookmark-toggle-button');
      showButton.textContent = 'ブクマといいね';

      const niceButton = document.createElement('input');
      niceButton.classList.add('_button-large');
      niceButton.value = '❤';
      niceButton.type = 'button';
      niceButton.style.padding = '5px';

      const bookmarkDelButton = document.createElement('input');
      bookmarkDelButton.classList.add('_button-large');
      bookmarkDelButton.value = PixivOfficial.CONSTANTS.BOOKMARK_TEXT.DEL;
      bookmarkDelButton.type = 'button';
      bookmarkDelButton.style.display = 'none';
      bookmarkDelButton.style.padding = '5px';

      const modalContainer = self.getModalBookmark();
      const bookmarkAddButton = modalContainer.querySelector('input[type=submit]');
      const bookmarkComment = modalContainer.querySelector('input[name=comment]');
      const bookmarkTag = modalContainer.querySelector('input[name=tag]');
      const closeBtn = modalContainer.getElementsByClassName('ui-modal-close')[0];

      this.modalBookmark = {
        recommendButton_: recommendButton,
        recommendIFrame_: recommendIFrame,
        showButton_: showButton,
        niceButton_: niceButton,
        bookmarkDelButton_: bookmarkDelButton,
        modalContainer_: modalContainer,
        bookmarkAddButton_: bookmarkAddButton,
        restrictRadios_: modalContainer.querySelectorAll('input[name=restrict]'),
        bookmarkComment_: bookmarkComment,
        bookmarkTag_: bookmarkTag,
        closeButton_: closeBtn,
      };

      const mb = self.modalBookmark;
      // 良いねボタンとブクマ解除ボタンの追加
      const modalContent = mb.modalContainer_.getElementsByClassName('content')[0];
      const submitContainer = modalContent.getElementsByClassName('submit-container')[0];
      submitContainer.appendChild(mb.bookmarkDelButton_);
      submitContainer.appendChild(mb.niceButton_);
      // おすすめ表示パネルとおすすめ表示用のiframe追加
      modalContent.appendChild(mb.recommendButton_);
      modalContent.appendChild(mb.recommendIFrame_);
      // モーダル表示ボタンを設置
      showBtnParent.appendChild(mb.showButton_);


      this.modalBookmark.hiddenParam = {};
      this.modalBookmark.hiddenParam.bookId_ = null;

      // bookIdとrestrictを取得するまで無効
      // 本当はaddは編集時のみ必要だけど面倒だから一緒に。
      mb.bookmarkAddButton_.disabled = true;
      mb.bookmarkDelButton_.disabled = true;
      mb.niceButton_.disabled = self.isRated();

      // サムネイルがデフォルトだとsrc属性を設定されていないので、その設定
      const modalThumb = mb.modalContainer_.getElementsByClassName('bookmark_modal_thumbnail')[0];
      modalThumb.setAttribute('src', modalThumb.getAttribute('data-src'));


      // モーダルの閉じるボタンに意味を持たせる(デフォだと機能してない)
      mb.closeButton_.addEventListener('click', function(e) {
        e.preventDefault();
        mb.modalContainer_.style.display = 'none';
      });

      // iframeの内容をおすすめ以外の部分がいらないので削除(jqueryのonloadだと何故か動かない)
      mb.recommendIFrame_.addEventListener('load', function() {
        const ifBody = mb.recommendIFrame_.contentDocument;
        ifBody.getElementById('wrapper').setAttribute('style', 'margin:0');
        ifBody.getElementsByClassName('layout-body')[0].setAttribute('style', 'margin:0');
        ifBody.getElementById('illust-recommend').setAttribute('style', 'padding:0');
        const toolmenu = ifBody.getElementsByClassName('_toolmenu')[0];
        const header = ifBody.getElementsByClassName('layout-wrapper')[0];
        const bmrkDetail = ifBody.getElementsByClassName('_unit bookmark-detail-unit')[0];
        const bmrkUsers =
          ifBody.getElementsByClassName('_unit _list-unit bookmark-list-unit scroll')[0];
        const samePerson =
          ifBody.getElementsByClassName('layout-body')[0].getElementsByClassName('_unit')[2];
        const footer = ifBody.getElementsByClassName('footer _classic-footer ya-pc-overlay')[0];
        toolmenu.parentNode.removeChild(toolmenu);
        header.parentNode.removeChild(header);
        bmrkDetail.parentNode.removeChild(bmrkDetail);
        bmrkUsers.parentNode.removeChild(bmrkUsers);
        samePerson.parentNode.removeChild(samePerson);
        footer.parentNode.removeChild(footer);
      });

      // モーダルフォームの元の下半分削除(個人的にいらないし元から動いてないので)

      const underpart = mb.modalContainer_.getElementsByClassName('_list-unit scroll')[0];
      underpart.parentNode.removeChild(underpart);

      // モーダルフォームの体裁整え
      mb.modalContainer_.getElementsByClassName('title-unit')[0].style.padding = '3px';
      const detailUnit =
        mb.modalContainer_.getElementsByClassName('_unit bookmark-detail-unit')[0];
      detailUnit.paddingTop = '10px';
      detailUnit.paddingBottom = '10px';

      /**
       * hashToQuery - 連想配列から?を除いたクエリ文字列を生成する
       *
       * @param  {assoc} hash クエリ連想配列
       * @return {string}      クエリ文字列
       */
      function hashToQuery(hash) {
        let result = '';
        Object.keys(hash).forEach(function(key) {
          result += key + '=' + encodeURIComponent(hash[key]) + '&';
        });
        result = result.substr(0, result.length - 1);
        return result;
      }


      /**
       * queryToHash - クエリ文字列を連想配列にする
       *
       * @param  {string} [query] "?"を含んだURLなどの文字列
       * @return {void}          description
       */
      function queryToHash(query) {
        console.log('queryToHash');
        if (typeof query === 'undefined') {
          query = location.search;
        }

        let hash;
        const result = {};
        const param = query.substring(query.indexOf('?') + 1).split('&');
        for (let i = 0; i < param.length; i++) {
          hash = param[i].split('=');
          result[hash[0]] = hash[1];
        }
        return result;
      }


      /**
       * setRecommendIframeCSS - おすすめiframeのCSSを設定(主目的はheightリサイズ)
       *
       * @param  {void} function( description
       * @return {void}           description
       */
      const setRecommendIframeCSS = function() {
        const windowH = window.innerHeight;
        const modalH = mb.modalContainer_.getElementsByClassName('layout-fixed')[0].offsetHeight;
        mb.recommendIFrame_.style.width = '100%';
        mb.recommendIFrame_.style.height = (windowH - modalH - 60) + 'px';
      };

      // ウィンドウリサイズ時にも対応
      // window.onresize = setRecommendIframeCSS;
      window.addEventListener('resize', function() {
        setRecommendIframeCSS();
      });


      // おすすめ表示ボタンの処理
      // 本当はiframeなんて使いたくなかったけど、ajaxだとオートビューが効かないし
      // おすすめコンテンツ取得できないし、自分でオートビューさせるのは手間すぎるので。
      mb.recommendButton_.addEventListener('click', function() {
        setRecommendIframeCSS();
        if (mb.recommendIFrame_.style.display === 'none') {
          mb.recommendIFrame_.style.display = 'block';
        } else {
          mb.recommendIFrame_.style.display = 'none';
        }
      });


      // ブックマーク追加ボタンの処理
      mb.bookmarkAddButton_.addEventListener('click', function(e) {
        e.preventDefault();
        const req = new XMLHttpRequest();
        req.onreadystatechange = function() {
          if (req.readyState === 4) {
            if (req.status === 200) {
              // 追加後の編集のときだけ見た目上の後処理。編集時には何もしない。
              const mainBmrkBtn = self.getBookmarkButton();
              console.log(mainBmrkBtn);
              if (self.bookmarkButtonText === PixivOfficial.CONSTANTS.BOOKMARK_TEXT.ADD) {
                self.bookmarkButtonText = PixivOfficial.CONSTANTS.BOOKMARK_TEXT.EDIT;
                mainBmrkBtn.classList.add('bookmarked');
                mainBmrkBtn.classList.add('edit-bookmark');
                mainBmrkBtn.classList.remove('add-bookmark');
                const bmrkIcon = mainBmrkBtn.getElementsByClassName('bookmark-icon')[0];
                bmrkIcon.parentNode.removeChild(bmrkIcon);
              }
              // 処理完了後にモーダルを閉じる
              mb.modalContainer_.style.display = 'none';
            } else {
              throw new Error('ブックマークの追加に失敗した可能性があります');
            }
          } else {
            // result.innerHTML = "通信中...";
          }
        };

        const query = {
          mode: 'add',
          tt: self.getToken(),
          id: self.getContentId(),
          type: 'illust',
          tag: mb.bookmarkTag_.value,
          comment: mb.bookmarkComment_.value,
          restrict: self.restrict,
        };
        console.log(query);
        req.open('POST', 'bookmark_add.php', true);
        req.setRequestHeader('content-type',
          'application/x-www-form-urlencoded;charset=UTF-8');
        req.send(hashToQuery(query));

        //いいね
        mb.niceButton_.click();
      });


      // ブックマーク解除ボタンの処理
      mb.bookmarkDelButton_.addEventListener('click', function() {
        const req = new XMLHttpRequest();
        req.onreadystatechange = function() {
          if (req.readyState === 4) {
            if (req.status === 302) {
              // 見た目上の後処理を行う
              const mainBmrkBtn = self.getBookmarkButton();
              mainBmrkBtn.classList.add('add-bookmark');
              mainBmrkBtn.classList.remove('bookmarked');
              mainBmrkBtn.classList.remove('edit-bookmark');
              mainBmrkBtn.insertAdjacentHTML('afterbegin', '<span class="bookmark-icon"></span>');
              self.bookmarkButtonText = PixivOfficial.CONSTANTS.BOOKMARK_TEXT.ADD;

              // 処理完了後にモーダルを閉じる
              mb.modalContainer_.style.display = 'none';
            } else {
              throw new Error('ブクマ解除の通信に失敗した可能性があります。');
            }
          } else {
            // result.innerHTML = "通信中...";
          }
        };

        const query = {
          'tt': self.getToken(),
          'p': '1',
          'untagged': '0',
          'rest': 'show',
          'book_id[]': mb.hiddenParam.bookId_,
          'del': '1',
        };

        req.open('POST', 'bookmark_setting.php', true);
        req.setRequestHeader('content-type',
          'application/x-www-form-urlencoded;charset=UTF-8');
        req.send(hashToQuery(query));
      });


      // モーダルフォームのいいねボタンの処理
      mb.niceButton_.addEventListener('click', function() {
        if (!self.isRated()){
          const req = new XMLHttpRequest();
          req.onreadystatechange = function() {
            if (req.readyState === 4) {
              if (req.status === 200) {
                // かなり乱暴だけど元のいいねボタンは削除(仕様の把握ができなかった)
                const officialNiceBtn = self.getNiceButton();
                // todo:ここsuper使いたい
                console.log(officialNiceBtn);
                officialNiceBtn.parentNode.removeChild(officialNiceBtn);
                mb.niceButton_.disabled = true;
                console.log(mb.niceButton_.disabled);
              } else {
                throw new Error('いいねの通信に失敗した可能性があります。');
              }
            } else {
              // result.innerHTML = "通信中...";
            }
          };

          const query = {
            mode: 'save',
            i_id: self.getContentId(),
            score: '10',
            u_id: self.getUserId(),
            tt: self.getToken(),
            qr: 'false',
          };

          req.open('POST', 'rpc_rating.php', true);
          req.setRequestHeader('content-type',
            'application/x-www-form-urlencoded;charset=UTF-8');
          req.send(hashToQuery(query));
        }

      });


      // モーダルブクマ表示ボタンの処理
      mb.showButton_.addEventListener('click', function() {
        const bmrkBtnText = self.bookmarkButtonText;

        // モーダル側のブクマボタンのテキストも追従する
        mb.bookmarkAddButton_.value = bmrkBtnText;

        // ブクマ編集の場合は現在の設定を取得して反映
        if (bmrkBtnText === PixivOfficial.CONSTANTS.BOOKMARK_TEXT.EDIT) {
          // 最初の表示のみブックマーク編集ページからbookId[]と現在の公開設定を取得
          if (self.bookId === null) {
            console.log('awe1112');
            const req = new XMLHttpRequest();
            req.onreadystatechange = function() {
              if (req.readyState === 4) {
                if (req.status === 200) {
                  const result = document.createElement('div');
                  result.innerHTML = req.responseText;
                  self.bookId = result.querySelector('input[name="book_id[]"]').value;
                  self.restrict = result.querySelector('input[name="restrict"]:checked').value;
                  mb.bookmarkAddButton_.disabled = false;
                  mb.bookmarkDelButton_.disabled = false;
                }
              } else {
                // result.innerHTML = "通信中...";
              }
            };

            const query = {
              type: self.getArtType(),
              illust_id: self.getContentId(),
            };
            req.open('GET', 'bookmark_add.php?' + hashToQuery(query), true);
            req.send();
          }
          mb.bookmarkDelButton_.style.display = '';
        } else {
          // 追加時
          if (self.bookId === null) {
            self.restrict = 0;
          }
          mb.bookmarkAddButton_.disabled = false;
          mb.bookmarkDelButton_.style.display = 'none';
        }
        mb.modalContainer_.style.display = '';
      });
      console.log('initialize Modalbookamrk end');
    }


    /**
     * restrict - モーダルブックマーク上の公開/非公開ラジオボタンの選択値を取得
     *
     * @return {number}  0=公開, 1=非公開
     */
    get restrict() {
      return this.modalBookmark.modalContainer_
        .querySelectorAll('input[name=restrict]:checked')[0].value;
    }


    /**
     * set restrict - モーダルブックマー上の公開/非公開ラジオボタンの選択値を設定
     *
     * @param  {number} restrictVal 0=公開, 1=非公開
     * @return {void}
     */
    set restrict(restrictVal) {
      this.modalBookmark.restrictRadios_[restrictVal].checked = true;
    }


    /**
     * get bookId - ブックマーク固有IDの取得
     *
     * @return {number}  ブックマーク固有ID
     */
    get bookId() {
      console.log(this.modalBookmark.hiddenParam.bookId_);
      return this.modalBookmark.hiddenParam.bookId_;
    }


    /**
     * set bookId - ブックマーク固有IDの設定
     *
     * @param  {number} bookIdNumber ブックマーク固有ID
     * @return {void}              description
     */
    set bookId(bookIdNumber) {
      this.modalBookmark.hiddenParam.bookId_ = bookIdNumber;
    }

  }

  (function init() {
    // 条件不明だがたまにads_areaというクラスが設定されたiframeに反応して多重読み込みになっているので制限をかける
    // 本ページのbodyにはclass属性が設定されていないがiframeには設定されている
    if (document.body.getAttribute('class') === '') {
      const bmrkContainer = document.getElementsByClassName('bookmark-container')[0];
      new ModalBookmark(bmrkContainer);
    }
  })();
})();
