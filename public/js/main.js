/**
 * 图书借阅系统后台管理 - 前端交互(jQuery)
 * 1. 新增 / 修改表单必填项验证
 * 2. 删除前的确认提示
 */
$(function () {
  /* ---------- 表单必填项验证(新增 / 修改页) ---------- */
  $('#bookForm').on('submit', function () {
    var $form = $(this);
    var ok = true;
    var messages = [];

    // 必填项:图书编号、图书名称、图书类型、作者、出版社、出版日期
    var fields = [
      { name: 'bookCode', label: '图书编号' },
      { name: 'bookName', label: '图书名称' },
      { name: 'bookAuthor', label: '作者' },
      { name: 'publishPress', label: '出版社' },
      { name: 'publishDate', label: '出版日期' },
    ];

    $.each(fields, function (_, f) {
      var $input = $form.find('[name="' + f.name + '"]');
      var $err = $form.find('.field-error[data-for="' + f.name + '"]');
      if (!$.trim($input.val())) {
        ok = false;
        $input.addClass('error-input');
        $err.text('请输入' + f.label).show();
      } else {
        $input.removeClass('error-input');
        $err.hide();
      }
    });

    // 图书类型(下拉必须选择)
    var $type = $form.find('[name="bookType"]');
    var $typeErr = $form.find('.field-error[data-for="bookType"]');
    if (!$type.val()) {
      ok = false;
      $type.addClass('error-input');
      $typeErr.text('请选择图书类型').show();
    } else {
      $type.removeClass('error-input');
      $typeErr.hide();
    }

    // 出版日期不能晚于今天
    var $date = $form.find('[name="publishDate"]');
    var $dateErr = $form.find('.field-error[data-for="publishDate"]');
    var dateVal = $date.val();
    if (dateVal && !$date.hasClass('error-input')) {
      var today = new Date();
      var todayStr = today.getFullYear() + '-' +
        String(today.getMonth() + 1).padStart(2, '0') + '-' +
        String(today.getDate()).padStart(2, '0');
      if (dateVal > todayStr) {
        ok = false;
        $date.addClass('error-input');
        $dateErr.text('出版日期不能晚于今天').show();
      }
    }

    // 图书编号查重(同步 AJAX,确保提交前校验)
    var $code = $form.find('[name="bookCode"]');
    var $codeErr = $form.find('.field-error[data-for="bookCode"]');
    if ($.trim($code.val()) && !$code.hasClass('error-input')) {
      var available = false;
      $.ajax({
        url: '/books/check-code',
        data: { bookCode: $code.val(), excludeId: $code.data('exclude-id') || '' },
        async: false,
        dataType: 'json',
        success: function (res) { available = !!res.available; },
        error: function () { available = true; /* 服务异常时不阻断提交,交给服务端校验 */ }
      });
      if (!available) {
        ok = false;
        $code.addClass('error-input');
        $codeErr.text('图书编号已存在,请更换').show();
      }
    }

    var $box = $form.find('.form-error');
    if (!ok) {
      $box.text('表单校验未通过,请检查标红字段!').show();
      return false;
    }
    $box.hide();
    return true;
  });

  // 输入时即时清除错误样式
  $('#bookForm input, #bookForm select').on('change input', function () {
    $(this).removeClass('error-input');
    var name = $(this).attr('name');
    $('.field-error[data-for="' + name + '"]').hide();
  });

  /* ---------- 图书编号失焦 AJAX 查重(新增 / 修改页) ---------- */
  var $codeInput = $('#bookForm [name="bookCode"]');
  $codeInput.on('blur', function () {
    var val = $.trim($(this).val());
    var $err = $(this).closest('.fcontrol').find('.field-error[data-for="bookCode"]');
    if (!val) return;
    $.getJSON('/books/check-code', {
      bookCode: val,
      excludeId: $(this).data('exclude-id') || ''
    }).done(function (res) {
      if (res.available === false) {
        $(this).addClass('error-input');
        $err.text('图书编号已存在,请更换').show();
      } else {
        $(this).removeClass('error-input');
        $err.hide();
      }
    }.bind(this));
  });

  /* ---------- 删除确认提示(列表页) ---------- */
  $('.js-delete-form').on('submit', function () {
    return window.confirm('确定删除该图书信息?');
  });
});
