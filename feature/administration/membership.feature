Feature:
  As an admin user
  I want to be able to create members for a scheme
  So that members and organisations can report data

  Background:
    Given an administrator named "John"
    And I am logged in as "John"
    And a scheme "East Sussex"

  Scenario: Bulk create members
    Given there are "0" members in the scheme
    When I create "50" members
    Then I should get "50" unique IDs back
    And the scheme should contain "50" members

