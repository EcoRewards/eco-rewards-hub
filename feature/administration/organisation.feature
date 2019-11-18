Feature:
  As an admin user
  I want to be able to set up an organisation
  So that I can allow organisations to report data

  Background:
    Given an administrator named "John"
    And I am logged in as "John"
    And a scheme "Norfolk"
    And a scheme "Suffolk"
    And a scheme "Essex"

  Scenario: Create a organisation
    When I create an organisation "Transport Operator Ltd" in the scheme "Norfolk"
    Then I should see "Transport Operator Ltd" in the list of organisations "1" times

  Scenario: Prevent multiple organisations with the same name
    Given an organisation "School Org" in the scheme "Norfolk"
    When I create an organisation "School Org" in the scheme "Norfolk"
    Then I should get an "409" error
    And I should see "School Org" in the list of "Norfolk" organisations "1" times

  Scenario: Allow multiple organisations with the same name in different schemes
    Given an organisation "Another Org" in the scheme "Suffolk"
    When I create an organisation "Another Org" in the scheme "Essex"
    And I should see "School Org" in the list of "Norfolk" organisations "1" times
    And I should see "School Org" in the list of "Essex" organisations "1" times

  @NotRequired
  Scenario: Edit an organisation's name

  @NotRequired
  Scenario: Edit an organisation's scheme

  @NotRequired
  Scenario: An organisation belonging to multiple schemes
