Feature:
  As a member
  I want to report my journeys via LORaWAN
  So that I can earn points

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Scotland"
    And I create an organisation "Scottish School" in scheme "Scotland"
    And I create a group "Scotland 2020" in the organisation "Scottish School"

  Scenario: Smartcard tap
    When I create an account with smartcard "634321002222230090"
    And I tap with a smartcard "634321002222230090" on device "123456"
    Then I should see the following journeys
      | member              | source | travel date         | mode  | distance | device |
      | 634321002222230090  | Test   | 2019-01-01 00:01:00 | bus   | 1.5      | 123456 |
    And I tap with a smartcard "634321002222230090" on device "123456"
    Then I should see the following journeys
      | member              | source | travel date         | mode  | distance | device |
      | 634321002222230090  | Test   | 2019-01-01 00:01:00 | bus   | 1.5      | 123456 |
    And I wait until the rewards have been processed
    And these members should have the following rewards
      | member              | rewards | carbon saving |
      | 634321002222230090  | 250     | 0.33          |
    And I tap with a smartcard "634321002222230090" on device "1345456"
    Then I should see the following journeys
      | member              | source | travel date         | mode  | distance | device  |
      | 634321002222230090  | Test   | 2019-01-01 00:01:00 | bus   | 1.5      | 1345456 |
    And I wait until the rewards have been processed
    And these members should have the following rewards
      | member              | rewards | carbon saving |
      | 634321002222230090  | 400     | 0.66          |
