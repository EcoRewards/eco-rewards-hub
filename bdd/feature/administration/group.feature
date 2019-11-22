@skipped
Feature:
  As an admin user
  I want to be able to set up a group
  So that I can report on members in specific groups

  Background:
    Given I am logged in as an administrator
    And a scheme "Dorset"
    And an organisation "Dorset School" in scheme "Dorset"

  Scenario: Create a group
    When I create an group "Dorset School" in the organisation "Dorset"
    Then I should see "Dorset School" in the list of groups "1" times
