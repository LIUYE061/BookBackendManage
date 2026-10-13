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

    var $box = $form.find('.form-error');
    if (!ok) {
      $box.text('带 * 的为必填项,请完整填写后再提交!').show();
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

  /* ---------- 删除确认提示(列表页) ---------- */
  $('.js-delete-form').on('submit', function () {
    return window.confirm('确定删除该图书信息?');
  });
});
