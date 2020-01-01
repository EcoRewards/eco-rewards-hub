Feature:
  As a user
  I want to register my smartcard
  So I can earn reward points

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Middlesex"
    And I create an organisation "Middlesex School" in scheme "Middlesex"
    And I create a group "Class of 2019" in the organisation "Middlesex School"

  Scenario: Create a member
    When I create an account with smartcard "654321002222230099"
    Then I should see a member "654321002222230099"
