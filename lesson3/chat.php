<?php
/**
 * simsimi_api - simsimi_api.php is a php file which is requesting information to Server.
 *
 * @Project Simsimi API Example
 * @Date 2014.08.06
 */

class requestParam
{
	
	private $lc; // Language code
	private $text; // Query message
	
   /*
	* Double(0.0~1.0) & Default value is 0.0
	* (0.0 is a bad Simsimi Version and 1.0 is a kind Simsimi Version.
	*/
	
	private $ft; 
	
	private $key; // your Trial-key value
	
	function __construct()
	{
			
			$this->text = null;
			$this->lc =null;
			$this->text = null;
			$this->key = "842ac0d6-903a-4723-a137-7f4cef28b57d";
	}
	
	/**
	 * Retrieve the value of text.
	 *
	 * @return A String data type.
	 */
	public function getText()
	{
		return $this->text;
	}
	
	/**
	 * set the value of text.
	 *
	 * @param text
	 *            A variable of type String.
	 */
	public function setText($text)
	{
		$this->text =  urlencode($text);
	}
	
	/**
	 * Retrieve the value of Language code(Lc).
	 *
	 * @return A String data type.
	 */
	public function getLC()
	{
		return $this->lc;
	}
	
	/**
	 * set the value of lc.
	 *
	 * @param lc
	 *            A variable of type String.
	 */
	public function setLC($lc)
	{
		$this->lc = $lc==null?"en":urlencode($lc);
	}
	
	/**
	 * Retrieve the value of ft.
	 *
	 * @return A double data type.
	 */
	public function getFt()
	{
		return $this->ft;
	}
	
	/**
	 * set the value of ft.
	 *
	 * @param ft
	 *            A variable of type double.
	 */
	public function setFt($ft)
	{
		$this->ft = $ft;
	}
	
	/**
	 * Retrieve the value of key.
	 *
	 * @return A String data type.
	 */
	public function getKey()
	{
		return $this->key;
	}
	
	
	public function __destruct()
	{
		
	}
	
}

header('Content-Type: text/html; charset=UTF-8');
$requestparam = new requestParam();
$key = $requestparam->getKey();
$requestparam->setLC("en");
$requestparam->setText($_GET['text']);
$lc = $requestparam->getLC();
$text =$requestparam->getText();
$ch = curl_init(); // Session Initialization.
curl_setopt ($ch, CURLOPT_URL,"http://api.simsimi.com/request.p?key=".$key."&ft=1.0&lc=".$lc."&text=".$text); // URL to request information to Server.
curl_setopt ($ch, CURLOPT_HTTPGET, 1); // Http method is GET
curl_setopt ($ch, CURLOPT_RETURNTRANSFER, 1); // whether you receitved returned result
$result = curl_exec ($ch); //curl execute.
curl_close ($ch); // close curl session.
echo $result;
?>