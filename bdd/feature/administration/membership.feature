Feature:
  As an admin user
  I want to be able to create members
  So that providers can report data

  Background:
    Given I am logged in as an administrator
    And I create a scheme "East Sussex"
    And I create an organisation "East Sussex School" in scheme "East Sussex"
    And I create a group "Sussex 2019" in the organisation "East Sussex School"

  Scenario: Bulk create members
    Given there are "0" members in the group "Sussex 2019"
    When I create "50" members in the group "Sussex 2019"
    Then I should get "50" unique IDs back
    And the group "Sussex 2019" should contain "50" members
