Feature:
  As a member
  I want to be able to report my usage (self reporting via web page)
  So I can get eco-rewards

  Background:
    Given I am logged in as an administrator
    And I create a scheme "Surrey"
    And I create an organisation "Surrey School" in scheme "Surrey"
    And I create a group "Surrey 2020" in the organisation "Surrey School"

  Scenario: Upload by a member via an organisation
    When I create an account with smartcard "654321002222240099"
    Then I add "4.1" miles usage by "bus" for member "654321002222240099"
    Then I scan a QR code at "43.11","1.11" for member "654321002222240099"
    And I wait until the rewards have been processed
    And these members should have the following rewards
      | member              | rewards | carbon saving |
      | 654321002222240099  | 250     | 0.9000        |
      | 654321002222240099  | 250     | 0.9000        |
