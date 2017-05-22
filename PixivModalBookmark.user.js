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
  'use strict';

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
      this.mMainForm = {
        $mBookmarkButton: $bookmarkModal,
        $mBookmarkButtonDescription: $bookmarkModal.children('.description'),
        $mNiceButton: $('._nice-button.js-nice-button'),
      };

      // pixiv.～はpixiv公式のグローバル変数(?)
      this.mSetting = {
        mArtType: pixiv.context.type,
        mToken: $commentForm.find('input[name="tt"]').val(),
        mUserId: pixiv.user.id,
        mBookId: null,
        mRestrict: null,
        mContentId: null,
      };

      if (this.mSetting.mArtType == 'illust') {
        this.mSetting.mContentId = $commentForm.find('input[name="illust_id"]').val();
      } else {
        this.mSetting.mContentId = $commentForm.find('input[name="id"]').val();
      }
      console.log('initialize PixivOfficial end');
    }


    /**
     * BMRK_TEXT - ブックマークボタンのテキスト
     *
     * @return {string}  description
     */
    static get BMRK_TEXT() {
      return {
        ADD: 'ブックマークに追加',
        EDIT: 'ブックマークを編集',
        DEL: 'ブックマーク解除',
      };
    }


    /**
     * get mainForm - Pixivメインフォームに存在するパーツを管理
     *
     * @return {associated}  description
     */
    get mainForm() {
      return {
        $bookmarkButton: this.mMainForm.$mBookmarkButton,
        $niceButton: this.mMainForm.$mNiceButton,
        $bookmarkButtonDescription: this.mMainForm.$mBookmarkButtonDescription,
      };
    }


    /**
     * get setting - Pixiv固有の設定値?を管理
     *
     * @return {associated}  description
     */
    get setting() {
      return {
        artType: this.mSetting.mArtType,
        token: this.mSetting.mToken,
        userId: this.mSetting.mUserId,
        contentId: this.mSetting.mContentId,
        bookId: this._getBookId,
        restrict: this._getRestrict,
      };
    }

    /**
     * setSetting - 連想配列に対してsetterを使う方法がわからなくて苦肉の策
     *
     * @return {void}  description
     */
    setSetting() {
      const that = this;
      return {
        restrict: function(val) {
          that.mSetting.mRestrict = val;
        },
      };
    }

    // get bookmarkButton() { return this.$mBookmarkButton; }
    // set bookmarkButton(jQueryObj) { this.$mBookmarkButton = jQueryObj; }
    // get niceButton() { return this.$mNiceButton; }
    // set niceButton(jQueryObj) { this.$mNiceButton = jQueryObj; }
    // get bookmarkButtonText() { return this.$mBookmarkButtonDescription.text(); }
    // set bookmarkButtonText(text) { this.$mBookmarkButtonDescription.text(text); }
    // get token() { return this.mToken; }
    // set token(text) { this.mToken = text; }
    // get userId() { return this.mUserId; }
    // set userId(text) { this.mUserId = text; }
    // get contentId() { return this.mContentId; }
    // set contentId(text) { this.mContentId = text; }


    /**
     * get _getBookId - (内部プロパティ)book_id[]値を取得して返す
     *
     * @return {number}  これが何者かは不明
     */
    get _getBookId() {
      if (this.mSetting.mBookId == null) this._getBookIdAndRestrict();
      return this.mSetting.mBookId;
    }


    /**
     * get _getRestrict - (内部プロパティ)restrict値を取得して返す
     *
     * @return {number}  0なら公開,1なら非公開
     */
    get _getRestrict() {
      if (this.mSetting.mRestrict == null) this._getBookIdAndRestrict();
      return this.mSetting.mRestrict;
    }


    /**
     * _getBookIdAndRestrict - ブクマ編集ページでしか取得できないbook_id[]と
     * restrictを取得する
     *
     * @return {void}  description
     */
    _getBookIdAndRestrict() {
      // todo:いつか非同期にしたい
      let cond = {
        type: 'GET',
        url: 'bookmark_add.php',
        async: false,
      };

      if (this.mSetting.mArtType == 'illust') {
        cond['data'] = {
          type: this.mSetting.mArtType,
          illust_id: this.mSetting.mContentId,
        };
      } else {
        // novelのときはtypeいらないみたい
        cond['data'] = {
          id: this.mSetting.mContentId,
        };
      }

      // ブックマーク編集ページから取得
      $.ajax(cond).done(
          (function(data) {
            this.mSetting.mBookId = $(data).find('input[name="book_id[]"]').val();
            this.mSetting.mRestrict = $(data).find('input[name="restrict"]:checked').val();
          }).bind(this)
        )
        .fail(function(jqXHR, textStatus, errorThrown) {
          alert('ブックマーク情報の取得に失敗しました\nステータスコード:' + jqXHR.status + '\n' + textStatus + '\n' + errorThrown);
        });
    }


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
     * @param  {object} $showButtonPanretObject モーダルブックマークを表示するボタンを設置する親となるjQueryObject
     * @return {void}                         description
     */
    constructor($showButtonPanretObject) {
      console.log('initialize Modalbookamrk start');
      super();
      const $modalPanel = $('.bookmark-add-modal');
      this.mModalForm = {
        $mModalPanel: $modalPanel,
        $mShowButton: $('<div />', {
          text: 'ブクマといいね',
          class: '_bookmark-toggle-button',
        }),
        $mBookmarkAddButton: $modalPanel.find('input[type="submit"]'),
        $mBookmarkDelButton: $('<input />', {
          class: '_button-large',
          value: PixivOfficial.BMRK_TEXT.DEL,
          type: 'button',
          display: 'none',
          style: 'padding:5px',
        }),
        $mRestrictRadio: $modalPanel.find('input[name="restrict"]'),
        $mBookmarkComment: $modalPanel.find('input[name="comment"]'),
        $mBookmarkTag: $modalPanel.find('input[name="tag"]'),
        $mNiceButton: $('<input />', {
          class: '_button-large',
          value: '❤',
          type: 'button',
          style: 'padding:5px',
        }),
        $mCloseButton: $('.ui-modal-close'),
        $mRecommendButton: $('<div></div>', {
          text: '▼この作品をブックマークした人はこんな作品もブックマークしています▼',
          style: 'width:100%; background-color:#ffffff; cursor:pointer; text-align:center',
        }),
        $mRecommendIFrame: $('<iframe></iframe>', {
          src: 'bookmark_detail.php?illust_id=' + this.setting.contentId,
        }),
      };

      // モーダルの閉じるボタンに意味を持たせる(デフォだと機能してない)
      this.mModalForm.$mCloseButton.click((function(e) {
        e.preventDefault();
        this.mModalForm.$mModalPanel.hide();
      }).bind(this));

      // モーダルフォームに良いねボタンとブクマ解除ボタンの追加
      this.mModalForm.$mBookmarkAddButton.after(this.mModalForm.$mNiceButton);
      this.mModalForm.$mBookmarkAddButton.after(this.mModalForm.$mBookmarkDelButton);
      // おすすめ表示パネルとおすすめ表示用のiframe追加
      this.mModalForm.$mModalPanel.find('.layout-fixed').append(this.mModalForm.$mRecommendButton);
      this.mModalForm.$mRecommendIFrame.hide();
      // いいね済みならボタン無効化
      this.mModalForm.$mNiceButton.attr('disabled', this.isRated());
      // サムネイルがデフォルトだとsrc属性を設定されていないので、その設定
      const $mModalThumbnail = this.mModalForm.$mModalPanel.find('img.bookmark_modal_thumbnail');
      $mModalThumbnail.attr('src', $mModalThumbnail.attr('data-src'));

      // おすすめ以外の部分がいらないので削除(jqueryのonloadだと何故か動かない)
      this.mModalForm.$mRecommendIFrame.on('load', function() {
        const $body = $('body', this.contentWindow.document);
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
      this.mModalForm.$mModalPanel.find('._list-unit.scroll').remove();

      // モーダルフォームの体裁整え
      this.mModalForm.$mModalPanel.find('._list-unit.scroll').css({padding: '0px'});
      this.mModalForm.$mModalPanel.find('.title-unit').css({padding: '3px'});
      this.mModalForm.$mModalPanel.find('._unit.bookmark-detail-unit').css({
        paddingTop: '10px',
        paddingBottom: '10px',
      });

      // モーダル表示ボタンを設置
      $showButtonPanretObject.append(this.mModalForm.$mShowButton);


      /**
       * const setRecommendIframeCSS - おすすめiframeのCSSを設定(主目的はheightリサイズ)
       *
       * @param  {void} function( description
       * @return {void}           description
       */
      const setRecommendIframeCSS = (function() {
        const windowH = $(window).height();
        const modalH = $('.layout-fixed').outerHeight(true);
        const css = {
          width: '100%',
          height: windowH - modalH - 30,
        };
        this.mModalForm.$mRecommendIFrame.css(css);
      }).bind(this);

      // ウィンドウリサイズ時にも対応
      $(window).resize(setRecommendIframeCSS);

      console.log('initialize Modalbookamrk end');


      // おすすめ表示ボタンの処理
      // 本当はiframeなんて使いたくなかったけど、ajaxだとオートビューが効かないし
      // おすすめコンテンツ取得できないし、自分でオートビューさせるのは手間すぎるので。
      this.mModalForm.$mRecommendButton.click((function() {
        if (this.mModalForm.$mModalPanel.find('iframe').length == 0) {
          this.mModalForm.$mModalPanel.find('.layout-fixed').after(this.mModalForm.$mRecommendIFrame);
          setRecommendIframeCSS();
        }
        this.mModalForm.$mRecommendIFrame.toggle();
      }).bind(this));


      // ブックマーク追加ボタンの処理
      this.mModalForm.$mBookmarkAddButton.click((function(e) {
        e.preventDefault();
        const that = this;

        $.ajax({
            type: 'POST',
            url: 'bookmark_add.php',
            data: {
              mode: 'add',
              tt: that.setting.token,
              id: that.setting.contentId,
              type: 'illust',
              tag: that.mModalForm.$mBookmarkTag.val(),
              comment: that.mModalForm.$mBookmarkComment.val(),
              restrict: that.modalForm.restrict,
            },
          })
          .done(function() {
            // 追加後の編集のときだけ見た目上の後処理。編集時には何もしない。
            if (that.mainForm.$bookmarkButtonDescription.text() == PixivOfficial.BMRK_TEXT.ADD) {
              that.mainForm.$bookmarkButton.addClass('bookmarked');
              that.mainForm.$bookmarkButton.addClass('edit-bookmark');
              that.mainForm.$bookmarkButton.removeClass('add-bookmark');
              that.mainForm.$bookmarkButton.find('.bookmark-icon').remove();
              that.mainForm.$bookmarkButtonDescription.text(PixivOfficial.BMRK_TEXT.EDIT);
            }
            // 現在のrestrict値を更新
            that.setSetting().restrict(that.modalForm.restrict);
            // 処理完了後にモーダルを閉じる
            that.mModalForm.$mModalPanel.hide();
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            alert('ブックマークに失敗しました\nステータスコード:' + jqXHR.status + '\n' + textStatus + '\n' + errorThrown);
          });
      }).bind(this));


      // ブックマーク解除ボタンの処理
      this.mModalForm.$mBookmarkDelButton.click((function() {
        const that = this;
        $.ajax({
            type: 'POST',
            url: 'bookmark_setting.php',
            data: {
              "del": 'ブックマーク解除',
              "tt": that.setting.token,
              "p": '1',
              "untagged": '0',
              "rest": 'show',
              'book_id[]': that.setting.bookId,
            },
          })
          .done(function() {
            // 302が帰ってくるせいでdoneには入ってこない。
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 302) {
              // 見た目上の後処理を行う
              that.mainForm.$bookmarkButton.addClass('add-bookmark');
              that.mainForm.$bookmarkButton.removeClass('bookmarked');
              that.mainForm.$bookmarkButton.removeClass('edit-bookmark');
              that.mainForm.$bookmarkButton.prepend($('<span>', {
                class: 'bookmark-icon',
              }));
              that.mainForm.$bookmarkButtonDescription.text(PixivOfficial.BMRK_TEXT.ADD);

              // 処理完了後にモーダルを閉じる
              that.mModalForm.$mModalPanel.hide();
            }else{
              alert('ブックマーク解除に失敗しました\nステータスコード:' + jqXHR.status + '\n' + textStatus + '\n' + errorThrown);
            }
          });
      }).bind(this));


      // モーダルフォームのいいねボタンの処理
      this.mModalForm.$mNiceButton.click((function() {
        const that = this;
        $.ajax({
            url: 'rpc_rating.php',
            type: 'POST',
            data: {
              mode: 'save',
              i_id: that.setting.contentId,
              score: '10',
              u_id: that.setting.userId,
              tt: that.setting.token,
              qr: 'false',
            },
          })
          .done(function() {
            //かなり乱暴だけど元のいいねボタンは削除(仕様の把握ができなかった)
            that.mainForm.$niceButton.remove();
            that.mModalForm.$mNiceButton.attr('disabled', true);
          })
          .fail(function(jqXHR, textStatus, errorThrown) {
            alert('[いいね]に失敗しました\nステータスコード:' + jqXHR.status + '\n' + textStatus + '\n' + errorThrown);
          });
      }).bind(this));


      // モーダルブクマ表示ボタンの処理
      this.mModalForm.$mShowButton.click((function() {
        this.mModalForm.$mBookmarkAddButton.val(this.mainForm.$bookmarkButtonDescription.text());
        // ブクマ編集の場合は現在の設定を取得して反映
        if (this.mainForm.$bookmarkButtonDescription.text() == PixivOfficial.BMRK_TEXT.EDIT) {
          this.mModalForm.$mRestrictRadio.val([this.setting.restrict]);
          this.mModalForm.$mBookmarkDelButton.show();
        } else {
          this.mModalForm.$mBookmarkDelButton.hide();
        }
        this.mModalForm.$mModalPanel.show();
      }).bind(this));
    }


    /**
     * get modalForm - モーダルフォームに関連するパーツを管理
     *
     * @return {associated}  description
     */
    get modalForm() {
      return {
        $modalPanel: this.mModalForm.$mModalPanel,
        $showButton: this.mModalForm.$mShowButton,
        $bookmarkAddButton: this.mModalForm.$mBookmarkAddButton,
        $bookmarkDelButton: this.mModalForm.$mBookmarkDelButton,
        $restrictRadio: this.mModalForm.$mRestrictRadio,
        $niceButton: this.mModalForm.$mNiceButton,
        $closeButton: this.mModalForm.$mCloseButton,
        restrict: this.mModalForm.$mRestrictRadio.filter(':checked').val(),
        $recommendButton: this.mModalForm.$mRecommendButton,
      };
    }


    //     get modalPanel() { return this.mModalForm.$mModalPanel; }
    //     get bookmarkAddButton() { return this.mModalForm.$mBookmarkAddButton; }
    //     get bookmarkDelButton() { return this.mModalForm.$mBookmarkDelButton; }
    //     get restrictRadio() { return this.mModalForm.$mRestrictRadio; }
    //     get restrictVal() { return this.mModalForm.$mRestrictRadio.filter(':checked').val(); }
    //     set restrictVal(val) { return this.mModalForm.$mRestrictRadio.val([val]); }
    //     get showButton() { return this.mModalForm.$mShowButton; }
    //     get niceButton() { return this.mModalForm.$mNiceButton; }
    //     get closeButton() { return this.mModalForm.$mCloeButton; }

  }

  (function init() {
    // 条件不明だがたまにads_areaというクラスが設定されたiframeに反応して多重読み込みになっているので制限をかける
    if ($('body').attr('class') == '') {
      new ModalBookmark($('.bookmark-container'));
    }
  })();
})(jQuery);
