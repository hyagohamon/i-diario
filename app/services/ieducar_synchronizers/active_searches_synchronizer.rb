class ActiveSearchesSynchronizer < BaseSynchronizer
  def synchronize!
    update_records(
      HashDecorator.new(
        api.fetch(
          escola: unity_api_code,
          ano: year
        )['busca_ativa']
      )
    )
  end

  private

  def api_class
    IeducarApi::ActiveSearches
  end

  def update_records(active_searches)
    active_searches.each do |active_search_record|
      student_enrollment = StudentEnrollment.find_by(api_code: active_search_record.ref_cod_matricula)
      next if student_enrollment.nil?

      ActiveSearcheSynchronizer.create_or_update_active_search(student_enrollment)
    end
  end
end
