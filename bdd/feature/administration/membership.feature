@skipped
Feature:
  As an admin user
  I want to be able to create members
  So that providers can report data

  Background:
    Given I am logged in as an administrator
    And a scheme "East Sussex"
    And an organisation "East Sussex School" in scheme "East Sussex"
    And a group "Class of 2017" in organisation "East Sussex School"

  Scenario: Bulk create members
    Given there are "0" members in the group "Class of 2017"
    When I create "50" members in the group "Class of 2017"
    Then I should get "50" unique IDs back
    And the group "Class of 2017" should contain "50" members
    And the members should have been sent to VAC via CSV