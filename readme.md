project -- voting application

WHAT : A functionality where a user can give vote to the given set of candidates

Models ?
Routes ?

voting app functionality

1. user can sign in / sign up
2. see the list of candidates
3. vote one of the candidate , after voting , user can't vote again
4. vote count of each candidates
5. user data must contain their one uniqe govt.id proof named : aadhar card number
   6.there should be one admin who who can only maintain the table of candidates and he can't able to vote at all
6. user can change our password
7. user can login only with aadhar card number and password
   9.admin can't vote at all

---

Routes ??

user Authentication:
/signup: POST - create a new user account.
/login: POST - login to an existing account [aadhar card number + Password]

voting:
/candidates: GET - get the list of candidates
/vote/:candidateId: POST - vote for a specific candidate

vote count:
/vote/counts: GET - get the list of candidates sorted by their counts.

User profile:
/profile: GET - get the user profile information
/profile/password: PUT - update and change user's password.

Admin candidate Management:
/candidate: POST - create a new candidate
/candidates/:candidateId: PUT - update an existing candidate.
/candidate/candidateId : DELETE - delete a candidate from the candidate list
