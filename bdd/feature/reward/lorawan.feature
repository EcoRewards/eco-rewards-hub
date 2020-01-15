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
    And I tap with a smartcard "634321002222230090"
    Then I should see the following journeys
      | member              | source | travel date         | mode  | distance |
      | 634321002222230090  | Test   | 2019-01-01 00:01:00 | bus   | 1.5      |

#  Scenario: NFC tap
#    When I create "1" members in the group "Scotland 2020"
#    And I tap with an NFC
#    Then I should see the following journeys
#      | member | source | travel date         | mode  | distance |
#      | 1      | Test   | 2020-01-14 09:54:30 | bus   | 1.000    |
