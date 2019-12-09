Feature:
  As a member
  I want to view my eco-rewards and carbon savings balance
  So I can track my usage

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Yorkshire"
    And I create an organisation "Yorkshire School" in scheme "Yorkshire"
    And I create a group "Yorkshire 2019" in the organisation "Yorkshire School"
    And I create "50" members in the group "Yorkshire 2019"

  Scenario: View a member
    When I view member a member in the group "Yorkshire 2019"
    Then they should have "0" rewards
    And a carbon saving of "0"
