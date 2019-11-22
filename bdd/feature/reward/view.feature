@skipped
Feature:
  As a member
  I want to view my eco-rewards and carbon savings balance
  So I can track my usage

  Background:
    Given I am logged in as an administrator
    And a scheme "Yorkshire"
    And an organisation "Yorkshire School" in scheme "Yorkshire"
    And a group "Class of 2017" in organisation "Yorkshire School"
    And the group "Class of 2017" contains members:
      | member | rewards |
      | 1001   | 150     |

  Scenario: Upload by a member via an organisation
    When I view the rewards for member "1001"
    Then I should see "150"
