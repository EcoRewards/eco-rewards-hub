Feature:
  As an admin user
  I want to be able to set up a group
  So that I can report on members in specific groups

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Dorset"
    And I create an organisation "Dorset School" in scheme "Dorset"

  Scenario: Create a group
    When I create a group "Class of 2019" in the organisation "Dorset School"
    Then I should see "Class of 2019" in the list of groups "1" times
