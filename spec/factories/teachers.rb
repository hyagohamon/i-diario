FactoryGirl.define do
  factory :teacher do
    sequence(:name) { |n| "Example Teacher #{n}" }
    sequence(:api_code) { |n| n }
  end
end