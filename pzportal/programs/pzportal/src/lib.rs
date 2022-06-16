// lets us use anchor, like an import
use anchor_lang::prelude::*;

declare_id!("CYAiXdNguaSdW43pQNqcmdHQiUbFNfteGCAiSre7NTJo");

// Declaring a module with #[]
#[program]
// Declaring a module, which will contain a collection
// of functions in variables very similar to a class
pub mod pzportal {
    // ??????
    use super::*;

    // Defining function (fn) called start_stuff_off
    pub fn start_stuff_off(ctx: Context<StartStuffOff>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.total_msgs = 0;
        Ok(())
    }

    pub fn add_msg(ctx: Context<AddMsg>, msg_content: String) -> Result <()> {
        let base_account = &mut ctx.accounts.base_account;
        let user = &mut ctx.accounts.user;

        let item = ItemStruct {
            msg_content: msg_content.to_string(),
            user_address: *user.to_account_info().key,
        };

        base_account.msg_list.push(item);
        base_account.total_msgs += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct StartStuffOff<'info> {
    // Initializes BaseAccount
    #[account(init, payer = user, space = 9000)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddMsg<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
    // Add the signer who calls the AddMsg method to the struct so that we can save it
    #[account(mut)]
    pub user: Signer<'info>,
}

// Define ItemStruct struct which will be a struct that contains the message content
// and the user that submitted that messages' public key.
#[derive(Debug, Clone, AnchorSerialize, AnchorDeserialize)]
pub struct ItemStruct {
    pub msg_content: String,
    pub user_address: Pubkey,
}

#[account]
pub struct BaseAccount {
    pub total_msgs: u64,
    // Struct BaseAccounts contains msg_list Vector (basically an array) 
    // in this case it will be an array of ItemStructs which is defined above
    pub msg_list: Vec<ItemStruct>,
}