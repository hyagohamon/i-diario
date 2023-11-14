require 'rails_helper'

RSpec.describe ListGradesByStepService, type: :service do
  let(:step_adult_and_youth) { 'adult_and_youth_education' }
  let(:step_child_education) { 'child_school' }
  let(:step_elementary_education) { 'elementary_school' }

  describe '#call' do
    shared_examples 'returns correct list of grades' do |step, expected_elements_count, *expected_elements|
      before { @list_grades = ListGradesByStepService.call(step) }

      it "returns list of grades for #{step}" do
        expect(@list_grades.size).to eq(expected_elements_count),
          "Expected #{expected_elements_count} grades, but got #{@list_grades.size}"

        expect(@list_grades).to include(*expected_elements),
          "Expected #{expected_elements} in the list, but some elements are missing"
      end
    end

    context 'when step is adult_and_youth_education' do
      it_behaves_like 'returns correct list of grades', 'adult_and_youth_education', 10,
                      { id: 'eja_first_year', name: '1º ano - EJA', text: '1º ano - EJA' },
                      { id: 'eja_second_year', name: '2º ano - EJA', text: '2º ano - EJA' },
                      { id: 'eja_third_year', name: '3º ano - EJA', text: '3º ano - EJA' },
                      { id: 'eja_fourth_year', name: '4º ano - EJA', text: '4º ano - EJA' }
    end

    context 'when step is child_school' do
      include_examples 'returns correct list of grades', 'child_school', 4,
                       { id: 'nursery_1', name: 'Creche - 0 a 1 ano e 6 meses',
                         text: 'Creche - 0 a 1 ano e 6 meses' },
                       { id: 'nursery_2', name: 'Creche - 1 ano e 7 meses a 3 anos e 11 meses',
                         text: 'Creche - 1 ano e 7 meses a 3 anos e 11 meses' },
                       { id: 'preschool', name: 'Pré-escola - 4 a 5 anos',
                         text: 'Pré-escola - 4 a 5 anos' }
    end

    context 'when step is elementary_school' do
      include_examples 'returns correct list of grades', 'elementary_school', 10,
                       { id: 'first_year', name: '1º ano', text: '1º ano' },
                       { id: 'second_year', name: '2º ano', text: '2º ano' },
                       { id: 'third_year', name: '3º ano', text: '3º ano' },
                       { id: 'fourth_year', name: '4º ano', text: '4º ano' }
    end
  end
end
