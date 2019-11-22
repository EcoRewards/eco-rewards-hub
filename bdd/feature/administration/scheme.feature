@skipped
Feature:
  As an admin user
  I want to be able to set up a scheme
  So that I can set up organisations under that scheme

  Background:
    Given I am logged in as an administrator

  Scenario: Create a scheme
    When I create a scheme "West of England"
    Then I should see "West of England" in the list of schemes "1" times
