// ==UserScript==
// @name        PixivModalBookmark
// @namespace   unote.hatenablog.com
// @include     https://www.pixiv.net/member_illust.php?*
// @require     https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js
// @version     1
// @grant       none
// ==/UserScript==

(function($) {
  const $bmrkModal = $('.bookmark-add-modal');
  const $btnMdlBmrk = $('<div />', {text:'ブクマといいね', class:'_bookmark-toggle-button'});
  const $btnMdlBmrkAdd = $bmrkModal.find('input[type="submit"]');
  const $btnMdlBmrkDel = $('<input />', {class: '_button-large', value:'ブックマークを解除', type:'button', display:'none', style:'padding:5px'});
  const mToken = $bmrkModal.find('input[name="tt"]').val();
  const mIllustId = $bmrkModal.find('input[name="id"]').val();
  const mUserId = $('input[name="user_id"]').val();
  const $btnMdlNice = $('<input />', {class: '_button-large', value:'❤', type:'button', style:'padding:5px'});
  const $btnOrgBmrk = $('._bookmark-toggle-button');
  const $orgDescription = $btnOrgBmrk.children('.description');
  const $btnNice = $('._nice-button.js-nice-button');
  let mBookId = null;
  let mRestrict = null;

  //ページ内のscriptに埋め込まれてるのでそのまま使う。他に判断できそうなパーツが無さそう。
  const mContentType = pixiv.context.type;

  //ブクマといいねボタンを追加
  $('.bookmark-container').append($btnMdlBmrk);
  //モーダルに追加と削除ボタンを追加
  $btnMdlBmrkAdd.after($btnMdlBmrkDel);
  $btnMdlBmrkDel.after($btnMdlNice);

  //いいねボタンの有効無効をいいねratedの有無で判断する
  $btnMdlNice.attr('disabled', ($('.score').find('.rated').length > 0) );
  //モーダルの下半分が邪魔だから消す
  //$bmrkModal.find('._list-unit.scroll').hide();
  $bmrkModal.find('._list-unit.scroll').children().remove();

  //モーダルの閉じるボタンに意味を持たせる(デフォだと機能してない)
  $('.ui-modal-close').click(function (e) {
    e.preventDefault();
    $bmrkModal.hide();
  });


  //ブックマーク表示
  $btnMdlBmrk.click(function (e) {
    e.preventDefault();

    $bmrkModal.show();
    if ( $orgDescription.text() == 'ブックマークを編集' ) {
      $btnMdlBmrkAdd.val('ブックマークを編集');
      const $rdoRestrict = $bmrkModal.find('input[name="restrict"]');
      //初回表示のみbook_id, restrictを取得するためにブクマ編集ページへ飛ぶ
      if (mBookId == null) {
        const deferredShow = bookmarkShow(); //bookmarkDel();
        deferredShow.done(function(data) {
          console.log('bookmark setting show complete');
          mBookId = $(data).find('input[name="book_id[]"]').val();
          mRestrict = $(data).find('input[name="restrict"]:checked').val();
          $rdoRestrict.val([mRestrict]);
          //$bmrkModal.find('._list-unit.scroll').append(data);
        });
      }

      if (mRestrict != null) {
        $rdoRestrict.val([mRestrict]);
      }
      $btnMdlBmrkDel.show();
    }else{
      $btnMdlBmrkDel.hide();
    }
  });


  //ブックマーク追加
  $btnMdlBmrkAdd.click(function(e) {
    e.preventDefault();

    const deferred = bookmarkAdd();
    //読み込み完了したらここの処理が実行される
    deferred.done(function() {
      bookmarkedPostProc('add');
      console.log('add bookmark comp');
      $bmrkModal.hide();
    });
  });


  function bookmarkedPostProc(type) {
    if (type == 'add') {
      $btnOrgBmrk.addClass('bookmarked');
      $btnOrgBmrk.addClass('edit-bookmark');
      $btnOrgBmrk.removeClass('add-bookmark');
      $orgDescription.text('ブックマークを編集');
      $btnOrgBmrk.find('.bookmark-icon').remove();
    }else{
      $btnOrgBmrk.addClass('add-bookmark');
      $btnOrgBmrk.removeClass('bookmarked');
      $btnOrgBmrk.removeClass('edit-bookmark');
      $orgDescription.text('ブックマークに追加');
      $btnOrgBmrk.prepend( $('<span>', {class:'bookmark-icon'}) );
    }
  }


  //ブックマーク解除
  $btnMdlBmrkDel.click(function() {
    //最初にbook_idを取得するためにブクマ編集ページへ飛ぶ
    const deferredDel = bookmarkDel(mBookId);
    deferredDel.done(function(data) {
      //302が帰ってくるせいでdoneには入ってこない。
      bookmarkedPostProc('del');
      console.log('remove bookmark comp');
      $bmrkModal.hide();
    });

    deferredDel.always(function(data) {
      bookmarkedPostProc('del');
      console.log('remove bookmark always');
      $bmrkModal.hide();
    });


  });


  $btnMdlNice.click(function() {
    const deffered = nice();
    deffered.done(function(data) {
      console.log('nice comp');
      $btnNice.remove();
      $btnMdlNice.attr('disabled', true);
    });


  });



  //ブクマ追加
  function bookmarkAdd() {
    const deferred = new $.Deferred();
    const restrictVal = $bmrkModal.find('input[name="restrict"]:checked').val();
    return $.ajax({
      type: 'POST',
      url: '/bookmark_add.php',
      data: {
        mode: 'add',
        tt: mToken,
        id: mIllustId,
        type: 'illust',
        tag: '',
        comment: '',
        restrict: restrictVal
      }
    })
    .done(function(data) {
      console.log('addbookmark');
      console.log('data');
    })
    .fail(function() {
      deferred.reject;
    })
    .always(function() {
      deferred.resolve;
    });
    //return deferred.promise();
  }

  //ボタン削除
  function bookmarkDel(bookId) {
    const deferred = new $.Deferred();
    //送信するものはあってるはずなのに302が帰ってくる。でもブクマ解除は成功する
    const ajaxConfig = {
      type: 'POST',
      url: '/bookmark_setting.php',
      data : {
        del: 'ブックマーク解除',
        tt: mToken,
        p: '1',
        untagged: '0',
        rest: 'show',
        'book_id[]': bookId
      }
    };
    console.log(ajaxConfig);
    return $.ajax(ajaxConfig)
    .done(function(data) {
      console.log('delete done');
    })
    .fail(function(data) {
      console.log('fail delete');
      deferred.reject();
    })
    .always(function(data) {
      console.log('always delete');
      deferred.resolve();
    });
  }


  function bookmarkShow() {
    //https://www.pixiv.net/bookmark_add.php?type=illust&illust_id=49968347
    const deferred = new $.Deferred();
    let cond = {
      type: 'GET',
      url: '/bookmark_add.php'
    };

    if ( mContentType == 'illust') {
      cond['data'] = {
        type: mContentType,
        illust_id: mIllustId
      };
    }else{
      cond['data'] = { id: mIllustId };
    }

    return $.ajax(cond)
    .done(function(data) {
      //console.log(data);
    })
    .fail(function(data) {
      console.log('fail show');
      deferred.reject();
    })
    .always(function(data) {
      console.log('always show');
      deferred.resolve();
    });
  }


  function nice() {
   const deferred = new $.Deferred();
   return $.ajax({
      url: '/rpc_rating.php',
      type: 'POST',
      data: {
        mode: 'save',
        i_id: mIllustId,
        score: '10',
        u_id: mUserId,
        tt: mToken,
        qr: 'false'
       }
    })
   .done(function() {
     console.log('nice');
   })
   .fail(function() {
     deferred.reject();
   })
   .always(function() {
     deferred.resolve();
   });
  }


})(jQuery);
