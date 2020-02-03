Feature:
  As a user
  I want to change my default transport mode and distance
  So my information can be up-to-date

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Middlesex2"
    And I create an organisation "Middlesex2 School" in scheme "Middlesex2"
    And I create a group "Class of 2019" in the organisation "Middlesex2 School"

  Scenario: Update a member
    When I create an account with smartcard "654321002222230999"
    Then I should see a default distance "1.5" and default transport mode "bus"
    When I change my distance "10" and I change my default transport "train"
    Then I should see a default distance "10" and default transport mode "train"
