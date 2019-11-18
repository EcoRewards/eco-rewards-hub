Feature:
  As an organisation
  I want to view my members eco-rewards and carbon savings balance
  So they my customers can see their rewards

  Background:
    Given a scheme "Yorkshire"
    And the scheme "Yorkshire" contains members:
      | member | rewards |
      | 1001   | 150     |
    And an organisation "Some Org" in the scheme "Yorkshire"

  Scenario: Upload by a member via an organisation
    And I am logged in as "Some Org"
    When I view the rewards for member "1001"
    Then I should see "150"
