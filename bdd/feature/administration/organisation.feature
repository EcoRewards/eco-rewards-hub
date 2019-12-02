Feature:
  As an admin user
  I want to be able to set up an organisation
  So that I can report on members on specific organisations

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Norfolk"

  Scenario: Create a organisation
    When I create an organisation "Norfolk School" in scheme "Norfolk"
    Then I should see "Norfolk School" in the list of organisations "1" times
    When I rename an organisation from "Norfolk School" to "Notre Dame High School"
    Then I should see "Norfolk School" in the list of organisations "0" times
    Then I should see "Notre Dame High School" in the list of organisations "1" times
    When I delete the organisation "Notre Dame High School"
    Then I should see "Notre Dame High School" in the list of organisations "0" times
