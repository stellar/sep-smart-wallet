#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, String};

#[contract]
pub struct WebAuthContract;

#[contractimpl]
impl WebAuthContract {
    pub fn web_auth_verify(
        _env: Env,
        address: String,
        _memo: Option<String>,            // IGNORED
        _home_domain: Option<String>,     // IGNORED
        _web_auth_domain: Option<String>, // IGNORED
        _client_domain: Option<String>,   // IGNORED
        _client_domain_address: Option<String>,
    ) {
        let addr = Address::from_string(&address);
        addr.require_auth();
    }
}
