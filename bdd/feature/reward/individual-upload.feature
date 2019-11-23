@pending
Feature:
  As a member
  I want to be able to report my usage (self reporting via web page)
  So I can get eco-rewards

  Background:
    Given I am logged in as an administrator
    And a scheme "Surrey"
    And an organisation "Surrey School" in scheme "Surrey"
    And a group "Class of 2017" in organisation "Surrey School"
    And the group "Class of 2017" contains members:
      | member | rewards |
      | 1001   | 0       |

  Scenario: Upload by a member via an organisation
    When I add "5000" meters usage by "bus" for member "1001"
    Then the scheme "Surrey" should contain an audit entry "api-upload" with a date
    And the members should have the following rewards:
      | member | rewards |
      | 1001   | 150     |
