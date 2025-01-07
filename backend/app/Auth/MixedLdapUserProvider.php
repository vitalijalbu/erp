<?php

namespace App\Auth;

use Illuminate\Auth\EloquentUserProvider;
use FreeDSx\Ldap\LdapClient;
use Illuminate\Contracts\Auth\Authenticatable as UserContract;
use Illuminate\Contracts\Hashing\Hasher as HasherContract;

class MixedLdapUserProvider extends EloquentUserProvider
{

    protected $ldap = null;

    public function __construct(HasherContract $hasher, LdapClient $ldap, $model)
    {
        parent::__construct($hasher, $model);
        $this->ldap = $ldap;
    }    
    
    public function validateCredentials(UserContract $user, array $credentials): bool
    {
        $plain = $credentials['password'];
        $username = $user->username;
        return $this->validateLdapCredentials($username, $plain);
    }
    
    protected function validateLdapCredentials($username, $password): bool
    {
        try {
            $this->ldap->bind($username.'@'.config('services.ldap.domain'), $password);
            return true;
        }
        catch(\FreeDSx\Ldap\Exception\BindException $e) {
            return false;        
        }
    }
}
