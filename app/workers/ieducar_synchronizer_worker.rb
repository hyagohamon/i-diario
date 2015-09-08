class IeducarSynchronizerWorker
  include Sidekiq::Worker

  def perform(entity_id, synchronization_id)
    entity = Entity.find(entity_id)

    entity.using_connection do
      synchronization = IeducarApiSyncronization.find(synchronization_id)

      begin
        # synchronize Courses, Grades and Classrooms
        CoursesGradesClassroomsSynchronizer.synchronize!(synchronization)

        # synchronize Knowledge Areas
        KnowledgeAreasSynchronizer.synchronize!(synchronization)

        # synchronize Disciplines
        DisciplinesSynchronizer.synchronize!(synchronization)

        # synchronize Teachers and relations
        TeachersSynchronizer.synchronize!(synchronization)

        # synchronize Students
        StudentsSynchronizer.synchronize!(synchronization)

        # synchronize Deficiencies
        DeficienciesSynchronizer.synchronize!(synchronization)

        # synchronize Disciplinary Occurrences
        ***REMOVED***sSynchronizer.synchronize!(synchronization)

        # synchronize RoundingTables
        RoundingTablesSynchronizer.synchronize!(synchronization)

        # synchronize Exam Rules
        ExamRulesSynchronizer.synchronize!(synchronization)

        # synchronize Recovery Exam Rules
        RecoveryExamRulesSynchronizer.synchronize!(synchronization)

        synchronization.mark_as_completed!
      rescue IeducarApi::Base::ApiError => e
        synchronization.mark_as_error!(e.message)
      rescue Exception => e
        # mark with error in any exception
        synchronization.mark_as_error!("Ocorreu um erro desconhecido.")
        raise e
      end
    end
  end
end
