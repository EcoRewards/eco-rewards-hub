@skipped
Feature:
  As an admin user
  I want to be able to set up an organisation
  So that I can report on members on specific organisations

  Background:
    Given I am logged in as an administrator
    And a scheme "Norfolk"

  Scenario: Create a organisation
    When I create an organisation "Norfolk School" in scheme "Norfolk"
    Then I should see "Norfolk School" in the list of organisations "1" times
