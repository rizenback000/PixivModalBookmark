// ==UserScript==
// @name        PixivModalBookmark
// @namespace   unote.hatenablog.com
// @include     https://www.pixiv.net/member_illust.php?mode=medium&illust_id=*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @version     1.1.1
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

(function($) {
  /**
   * Pixivがデフォルトで持っているものを管理しようとしたクラス
   */
  class PixivOfficial {
    /**
     * constructor - コンストラクタ
     *
     * @return {void}  description
     */
    constructor() {
      console.log('initialize PixivOfficial start');
      const $commentForm = $('form._comment-form');
      const $bookmarkModal = $('._bookmark-toggle-button');

      this.rb03 = {};
      this.rb03.pixivOfficial = {
        $bookmarkButton_: $bookmarkModal,
        $bookmarkButtonDescription_: $bookmarkModal.find('.description'),
        $niceButton_: $('._nice-button.js-nice-button'),
      };

      this.rb03.pixivOfficial.eigenValues = {
        // pixiv.～はpixiv公式のグローバル変数(?)
        artType_: pixiv.context.type,
        token_: $commentForm.children('input[name="tt"]').val(),
        userId_: pixiv.user.id,
        contentId_: null,
      };

      const ev = this.rb03.pixivOfficial.eigenValues;
      if (ev.artType_ === 'illust') {
        ev.contentId_ = $commentForm.children('input[name="illust_id"]').val();
      } else {
        ev.contentId_ = $commentForm.children('input[name="id"]').val();
      }
      console.log('initialize PixivOfficial end');
    }


    /**
     * BOOKMARK_TEXT - ブックマークボタンのテキスト
     *
     * @return {string}  description
     */
    static get BOOKMARK_TEXT() {
      return {
        ADD: 'ブックマークに追加',
        EDIT: 'ブックマークを編集',
        DEL: 'ブックマーク解除',
      };
    }


    /**
     * getPixivOfficial - getterの代わり
     * getterを使うと継承先で同じgetterが存在すると正常にアクセスできない
     * (実際にはsuperからできるが即時関数内でsuperが呼び出せないので
     * thisから呼び出した際にどこから呼び出したかわかるようにnamespace代わり)
     * もっといい方法があると思う
     *
     * @return {associated}  description
     */
    getPixivOfficial() {
      const po = this.rb03.pixivOfficial;
      const ev = this.rb03.pixivOfficial.eigenValues;
      return {
        bookmarkButtonText: po.$bookmarkButtonDescription_.text(),
        bookmarkButton: po.$bookmarkButton_,
        niceButton: po.$niceButton_,
        artType: ev.artType_,
        token: ev.token_,
        contentId: ev.contentId_,
        userId: ev.userId_,
      };
    }


    /**
     * setPixivOfficial - setter代わり
     * getと同じ理由によりこれで。
     *
     * @return {type}  description
     */
    setPixivOfficial() {
      const po = this.rb03.pixivOfficial;
      const ev = this.rb03.pixivOfficial.eigenValues;
      return {
        bookmarkButtonText: function(text) {
          po.$bookmarkButtonDescription_.text(text);
        },
        bookmarkButton: function(jQueryObj) {
          po.$bookmarkButton_ = jQueryObj;
        },
        niceButton: function(jQueryObj) {
          po.$niceButton_ = jQueryObj;
        },
        artType: function(type) {
          ev.artType_ = type;
        },
        token: function(token) {
          ev.token_ = token;
        },
        contentId: function(contentId) {
          ev.contentId_ = contentId;
        },
        userId: function(userId) {
          ev.userId_ = userId;
        },
      };
    }

    /*
    get bookmarkButton() {
      return this.rb03.pixivOfficial.$bookmarkButton_;
    }

    set bookmarkButton(jQueryObj) {
      this.rb03.pixivOfficial.$bookmarkButton_ = jQueryObj;
    }

    get niceButton() {
      return this.rb03.pixivOfficial.$niceButton_;
    }

    set niceButton(jQueryObj) {
      this.rb03.pixivOfficial.$niceButton_ = jQueryObj;
    }

    get bookmarkButtonText() {
      return this.rb03.pixivOfficial.$bookmarkButtonDescription_.text();
    }

    set bookmarkButtonText(text) {
      this.rb03.pixivOfficial.$bookmarkButtonDescription_.text(text);
    }

    get artType() {
      return this.rb03.pixivOfficial.eigenValues.artType_;
    }

    set artType(type) {
      this.rb03.pixivOfficial.eigenValues.artType_ = type;
    }

    get token() {
      return this.rb03.pixivOfficial.eigenValues.token_;
    }

    set token(number) {
      this.rb03.pipixivOfficial.eigenValues.token_ = number;
    }

    get contentId() {
      return this.rb03.pixivOfficial.eigenValues.contentId_;
    }

    set contentId(number) {
      this.rb03.pixivOfficial.eigenValues.contentId_ = number;
    }

    get userId() {
      return this.rb03.pixivOfficial.eigenValues.userId_;
    }

    set userId(number) {
      this.rb03.pixivOfficial.eigenValues.userId_ = number;
    }
    */

    /**
     * isRated - いいね済みかどうかを返す
     *
     * @return {boolean}  description
     */
    isRated() {
      return $('.score').find('.rated').length > 0;
    }

  }


  /**
   * モーダルブックマークを流用して使えるようにする
   */
  class ModalBookmark extends PixivOfficial {
    /**
     * constructor - コンストラクタ
     *
     * @param  {object} $showButtonPanretObject
     * モーダルブックマークを表示するボタンを設置する親となるjQueryObject
     * @return {void}                         description
     */
    constructor($showButtonPanretObject) {
      console.log('initialize Modalbookamrk start');
      super();
      const $modalPanel = $('.bookmark-add-modal');
      const cId = this.getPixivOfficial().contentId;

      this.rb03.modalBookmark = {
        $recommendButton_: $('<div></div>', {
          text: '▼この作品をブックマークした人は'+
                'こんな作品もブックマークしています▼',
          style: 'width:100%; background-color:#ffffff; '+
                 'cursor:pointer; text-align:center',
        }),
        $recommendIFrame_: $('<iframe></iframe>', {
          src: 'bookmark_detail.php?illust_id=' + cId,
        }),
        $showButton_: $('<div />', {
          text: 'ブクマといいね',
          class: '_bookmark-toggle-button',
        }),
        $niceButton_: $('<input />', {
          class: '_button-large',
          value: '❤',
          type: 'button',
          style: 'padding:5px',
        }),
        $bookmarkDelButton_: $('<input />', {
          class: '_button-large',
          value: PixivOfficial.BOOKMARK_TEXT.DEL,
          type: 'button',
          display: 'none',
          style: 'padding:5px',
        }),
        $modalPanel_: $modalPanel,
        $bookmarkAddButton_: $modalPanel.find('input[type="submit"]'),
        $restrictRadio_: $modalPanel.find('input[name="restrict"]'),
        $bookmarkComment_: $modalPanel.find('input[name="comment"]'),
        $bookmarkTag_: $modalPanel.find('input[name="tag"]'),
        $closeButton_: $modalPanel.find('.ui-modal-close'),
      };
      this.rb03.modalBookmark.hiddenParam = {};
      this.rb03.modalBookmark.hiddenParam.bookId_ = null;


      const mb = this.rb03.modalBookmark;

      // モーダルの閉じるボタンに意味を持たせる(デフォだと機能してない)
      mb.$closeButton_.click(function(e) {
        e.preventDefault();
        mb.$modalPanel_.hide();
      });

      // モーダルフォームに良いねボタンとブクマ解除ボタンの追加
      mb.$bookmarkAddButton_.after(mb.$niceButton_);
      mb.$bookmarkAddButton_.after(mb.$bookmarkDelButton_);
      // bookIdとrestrictを取得するまで無効
      // 本当はaddは編集時のみ必要だけど面倒だから一緒に。
      mb.$bookmarkAddButton_.attr('disabled', true);
      mb.$bookmarkDelButton_.attr('disabled', true);

      // おすすめ表示パネルとおすすめ表示用のiframe追加
      mb.$modalPanel_.find('.layout-fixed').append(mb.$recommendButton_);
      mb.$recommendIFrame_.hide();
      // いいね済みならボタン無効化
      mb.$niceButton_.attr('disabled', this.isRated());
      // サムネイルがデフォルトだとsrc属性を設定されていないので、その設定
      const $modalThumb = mb.$modalPanel_.find('img.bookmark_modal_thumbnail');
      $modalThumb.attr('src', $modalThumb.attr('data-src'));

      // おすすめ以外の部分がいらないので削除(jqueryのonloadだと何故か動かない)
      mb.$recommendIFrame_.on('load', function() {
        const $body = mb.$recommendIFrame_.contents();
        $body.find('#wrapper').attr('style', 'margin:0');
        $body.find('.layout-body').attr('style', 'margin:0');
        $body.find('#illust-recommend').attr('style', 'padding:0');
        $body.find('._toolmenu').remove();
        $body.find('.layout-wrapper').remove();
        $body.find('._unit.bookmark-detail-unit').remove();
        $body.find('._unit._list-unit.bookmark-list-unit.scroll').remove();
        $body.find('.layout-body').find('._unit:first-child').remove();
        $body.find('.footer._classic-footer.ya-pc-overlay').remove();
      });

      // モーダルフォームの元の下半分削除(個人的にいらないし元から動いてないので)
      mb.$modalPanel_.find('._list-unit.scroll').remove();

      // モーダルフォームの体裁整え
      mb.$modalPanel_.find('.title-unit').css({
        padding: '3px',
      });
      mb.$modalPanel_.find('._unit.bookmark-detail-unit').css({
        paddingTop: '10px',
        paddingBottom: '10px',
      });

      // モーダル表示ボタンを設置
      $showButtonPanretObject.append(mb.$showButton_);


      /**
       * const setRecommendIframeCSS - おすすめiframeのCSSを設定(主目的はheightリサイズ)
       *
       * @param  {void} function( description
       * @return {void}           description
       */
      const setRecommendIframeCSS = function() {
        const windowH = $(window).height();
        const modalH = $('.layout-fixed').outerHeight(true);
        const css = {
          width: '100%',
          height: windowH - modalH - 30,
        };
        mb.$recommendIFrame_.css(css);
      };

      // ウィンドウリサイズ時にも対応
      $(window).resize(setRecommendIframeCSS);

      console.log('initialize Modalbookamrk end');


      // おすすめ表示ボタンの処理
      // 本当はiframeなんて使いたくなかったけど、ajaxだとオートビューが効かないし
      // おすすめコンテンツ取得できないし、自分でオートビューさせるのは手間すぎるので。
      mb.$recommendButton_.click(function() {
        if (mb.$modalPanel_.find('iframe').length === 0) {
          mb.$modalPanel_.find('.layout-fixed').after(mb.$recommendIFrame_);
          setRecommendIframeCSS();
        }
        mb.$recommendIFrame_.toggle();
      });


      // ブックマーク追加ボタンの処理
      mb.$bookmarkAddButton_.click(function(e) {
        const that = this;
        e.preventDefault();


        $.ajax({
          type: 'POST',
          url: 'bookmark_add.php',
          data: {
            mode: 'add',
            tt: that.getPixivOfficial().token,
            id: that.getPixivOfficial().contentId,
            type: 'illust',
            tag: mb.$bookmarkTag_.val(),
            comment: mb.$bookmarkComment_.val(),
            restrict: that.restrict,
          },
        })
          .done(function() {
            // 追加後の編集のときだけ見た目上の後処理。編集時には何もしない。
            const $mainBmrkBtn = that.getPixivOfficial().bookmarkButton;
            if (that.getPixivOfficial().bookmarkButtonText === PixivOfficial.BOOKMARK_TEXT.ADD) {
              $mainBmrkBtn.addClass('bookmarked');
              $mainBmrkBtn.addClass('edit-bookmark');
              $mainBmrkBtn.removeClass('add-bookmark');
              $mainBmrkBtn.find('.bookmark-icon').remove();
              that.setPixivOfficial().bookmarkButtonText(PixivOfficial.BOOKMARK_TEXT.EDIT);
              // that.pixivOfficial.bookmarkButtonText = PixivOfficial.BOOKMARK_TEXT.EDIT;
            }
            // 処理完了後にモーダルを閉じる
            mb.$modalPanel_.hide();
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            alert('ブックマークに失敗しました\nステータスコード:' +
             jqXHR.status + '\n' + textStatus + '\n' + errorThrown);
          });
      }.bind(this));


      // ブックマーク解除ボタンの処理
      mb.$bookmarkDelButton_.click(function() {
        const that = this;
        $.ajax({
          type: 'POST',
          url: 'bookmark_setting.php',
          data: {
            'del': 'ブックマーク解除',
            'tt': that.getPixivOfficial().token,
            'p': '1',
            'untagged': '0',
            'rest': 'show',
            'book_id[]': mb.hiddenParam.bookId_,
          },
        })
          .done(function() {
            // 302が帰ってくるせいでdoneには入ってこない。
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 302) {
              // 見た目上の後処理を行う
              const $mainBmrkBtn = that.getPixivOfficial().bookmarkButton;
              $mainBmrkBtn.addClass('add-bookmark');
              $mainBmrkBtn.removeClass('bookmarked');
              $mainBmrkBtn.removeClass('edit-bookmark');
              $mainBmrkBtn.prepend($('<span>', {
                class: 'bookmark-icon',
              }));
              that.setPixivOfficial().bookmarkButtonText(PixivOfficial.BOOKMARK_TEXT.ADD);

              // 処理完了後にモーダルを閉じる
              mb.$modalPanel_.hide();
            } else {
              alert('ブックマーク解除に失敗しました\nステータスコード:' +
               jqXHR.status + '\n' + textStatus + '\n' + errorThrown);
            }
          });
      }.bind(this));


      // モーダルフォームのいいねボタンの処理
      mb.$niceButton_.click(function() {
        const that = this;
        $.ajax({
          url: 'rpc_rating.php',
          type: 'POST',
          data: {
            mode: 'save',
            i_id: that.getPixivOfficial().contentId,
            score: '10',
            u_id: that.getPixivOfficial().useId,
            tt: that.getPixivOfficial().token,
            qr: 'false',
          },
        })
          .done(function() {
            // かなり乱暴だけど元のいいねボタンは削除(仕様の把握ができなかった)
            that.getPixivOfficial().niceButton.remove();
            mb.$niceButton_.attr('disabled', true);
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            alert('[いいね]に失敗しました\nステータスコード:' +
             jqXHR.status + '\n' + textStatus + '\n' + errorThrown);
          });
      }.bind(this));


      // モーダルブクマ表示ボタンの処理
      mb.$showButton_.click(function() {
        const that = this;
        const bmrkBtnText = that.getPixivOfficial().bookmarkButtonText;

        // モーダル側のブクマボタンのテキストも追従する
        mb.$bookmarkAddButton_.val(bmrkBtnText);
        // ブクマ編集の場合は現在の設定を取得して反映
        if (bmrkBtnText === PixivOfficial.BOOKMARK_TEXT.EDIT) {
          // 最初の表示のみブックマーク編集ページからbookId[]と現在の公開設定を取得
          if (that.bookId === null) {
            let cond = {
              type: 'GET',
              url: 'bookmark_add.php',
            };

            if (that.getPixivOfficial().artType === 'illust') {
              cond.data = {
                type: that.getPixivOfficial().artType,
                illust_id: that.getPixivOfficial().contentId,
              };
            } else {
                // novelのときはtypeいらない
              cond.data = {
                id: that.getPixivOfficial().contentId,
              };
            }

            $.ajax(cond).done(function(data) {
              that.bookId = $(data).find('input[name="book_id[]"]').val();
              that.restrict = $(data).find('input[name="restrict"]:checked').val();
              mb.$bookmarkAddButton_.attr('disabled', false);
              mb.$bookmarkDelButton_.attr('disabled', false);
            })
                .fail(function(jqXHR, textStatus, errorThrown) {
                  alert('ブックマーク情報の取得に失敗しました\n'+
                  'もう一度ページを読み込むか\nステータスコード:' +
                   jqXHR.status + '\n' + textStatus + '\n' + errorThrown);
                });
          }
          mb.$bookmarkDelButton_.show();
        } else {
          if (that.bookId === null) {that.restrict = 0;}
          mb.$bookmarkAddButton_.attr('disabled', false);
          mb.$bookmarkDelButton_.hide();
        }
        mb.$modalPanel_.show();
      }.bind(this));
    }


    /**
     * get restrict - モーダルブックマーク上の公開/非公開ラジオボタンの選択値を取得
     *
     * @return {number}  0=公開, 1=非公開
     */
    get restrict() {
      return this.rb03.modalBookmark.$restrictRadio_.filter(':checked').val();
    }


    /**
     * set restrict - モーダルブックマー上の公開/非公開ラジオボタンの選択値を設定
     *
     * @param  {number} restrictVal 0=公開, 1=非公開
     * @return {void}
     */
    set restrict(restrictVal) {
      this.rb03.modalBookmark.$restrictRadio_.val([restrictVal]);
    }


    /**
     * get bookId - ブックマーク固有IDの取得
     *
     * @return {number}  ブックマーク固有ID
     */
    get bookId() {
      return this.rb03.modalBookmark.hiddenParam.bookId_;
    }


    /**
     * set bookId - ブックマーク固有IDの設定
     *
     * @param  {number} bookIdNumber ブックマーク固有ID
     * @return {void}              description
     */
    set bookId(bookIdNumber) {
      this.rb03.modalBookmark.hiddenParam.bookId_ = bookIdNumber;
    }


  }

  (function init() {
    // 条件不明だがたまにads_areaというクラスが設定されたiframeに反応して多重読み込みになっているので制限をかける
    // 本ページのbodyにはclass属性が設定されていないがiframeには設定されている
    if ($('body').attr('class') === '') {
      new ModalBookmark($('.bookmark-container'));
    }
  })();
})(jQuery);
