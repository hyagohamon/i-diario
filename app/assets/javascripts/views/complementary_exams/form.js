$(function () {
  'use strict';

  var flashMessages = new FlashMessages();
  var $classroom = $('#complementary_exam_classroom_id');
  var $discipline = $('#complementary_exam_discipline_id');
  var $setting = $('#complementary_exam_complementary_exam_setting_id');
  var $step = $('#complementary_exam_step_id');
  var $recorded_at = $('#complementary_exam_recorded_at');
  var with_recovery_note_in_step = false;

  function fetchSettings() {
    var classroom_id = $classroom.val();
    var discipline_id = $discipline.val();
    var step_id = $step.select2('val');

    $setting.select2('val', '');
    $setting.select2({ data: [] });

    if (!_.isEmpty(classroom_id) && !_.isEmpty(discipline_id) && !_.isEmpty(step_id)) {
      var parameters = {
        classroom_id: classroom_id,
        discipline_id: discipline_id,
        step_id: step_id
      };

      $.getJSON(Routes.settings_complementary_exams_pt_br_path(), parameters)
      .success(handleFetchSettingsSuccess)
      .fail(handleFetchSettingsError);
    }
  };

  function handleFetchSettingsSuccess(data) {
    var selectedSettings = _.map(data.complementary_exams, function(setting) {
      return { id: setting['id'], text: setting['description'] };
    });

    $setting.select2({ data: selectedSettings });
  };

  function handleFetchSettingsError() {
    flashMessages.error('Ocorreu um erro ao buscar as avaliações complementares da etapa selecionada.');
  };

  function fetchSettingInfo() {
    var id = $setting.select2('val');

    if (!_.isEmpty(id)) {
      $.getJSON(Routes.complementary_exam_setting_pt_br_path({id: id}))
      .success(handleFetchSettingInfoSuccess)
      .fail(handleFetchSettingInfoError);
    }
  };

  function handleFetchSettingInfoSuccess(data) {
    $('#complementary-exam-students').attr('data-scale', data.complementary_exam_setting.number_of_decimal_places);
    with_recovery_note_in_step = data.complementary_exam_setting.affected_score == 'step_recovery_score';
    if (!_.isEmpty($recorded_at.val())) {
      removeStudents();
      fetchStudents();
    }
  };

  function handleFetchSettingInfoError() {
    flashMessages.error('Ocorreu um erro ao buscar informações da avaliação informada.');
  };

  function fetchStudents() {
    var discipline_id = $discipline.val();
    var classroom_id = $classroom.val();
    var recorded_at = $recorded_at.val();

    if (!_.isEmpty(discipline_id) && !_.isEmpty(classroom_id) && !_.isEmpty(recorded_at)){
      $.ajax({
        url: Routes.by_date_student_enrollments_lists_pt_br_path({
          filter: {
            classroom: classroom_id,
            date: recorded_at,
            discipline: discipline_id,
            with_recovery_note_in_step: with_recovery_note_in_step,
            score_type: 'numeric'
          },
          format: 'json'
        }),
        success: handleFetchStudentsSuccess,
        error: handleFetchStudentsError
      });
    }
  };

  function handleFetchStudentsSuccess(data) {
    var student_enrollments_lists = data.student_enrollments_lists
    if (!_.isEmpty(student_enrollments_lists)) {
      var element_counter = 0;

      hideNoItemMessage();

      $('#complementary-exam-students').children("tr").remove();

      _.each(student_enrollments_lists, function(student_enrollment) {
        var element_id = new Date().getTime() + element_counter++

        var html = JST['templates/complementary_exams/student_fields']({
            id: student_enrollment.student.id,
            name: student_enrollment.student.name,
            element_id: element_id
          });

        $('#complementary-exam-students').append(html);
      });

      loadDecimalMasks();
    }
  };

  function handleFetchStudentsError() {
    flashMessages.error('Ocorreu um erro ao buscar os alunos.');
  };

  function removeStudents() {
    // Remove not persisted students
    $('.nested-fields.dynamic').remove();

    // Hide persisted students and sets _destroy = true
    $('.nested-fields.existing').hide();
    $('.nested-fields.existing [id$=_destroy]').val(true);

    showNoItemMessage();
  }

  function hideNoItemMessage() {
    $('.no_item_found').hide();
  }

  function showNoItemMessage() {
    if (!$('.nested-fields').is(":visible")) {
      $('.no_item_found').show();
    }
  }

  function loadDecimalMasks() {
    var numberOfDecimalPlaces = parseInt($('#complementary-exam-students').attr('data-scale')) || 0;
    $('.nested-fields input.decimal').inputmask('customDecimal', { digits: numberOfDecimalPlaces });
  }

  $step.on('change', function() {
    fetchSettings();
  });

  $setting.on('change', function() {
    fetchSettingInfo();
  });

  $recorded_at.on('change', function() {
    if (!_.isEmpty($setting.select2('val'))) {
      removeStudents();
      fetchStudents();
    }
  });

  // On load
  loadDecimalMasks();
});
