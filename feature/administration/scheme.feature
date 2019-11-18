Feature:
  As an admin user
  I want to be able to set up a scheme
  So that I can set up organisations under that scheme

  Background:
    Given an administrator named "John"
    And I am logged in as "John"

  Scenario: Create a scheme
    When I create a scheme "West of England"
    Then I should see "West of England" in the list of schemes "1" times

  Scenario: Prevent multiple schemes with the same name
    Given a scheme "Kent"
    When I create a scheme "Kent"
    Then I should get an "409" error
    And I should see "Bob's Organisation" in the list of schemes "1" times

  @NotRequired
  Scenario: Edit a scheme's name

  @NotRequired
  Scenario: Edit a scheme's scheme
